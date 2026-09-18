using Microsoft.EntityFrameworkCore;
using UniCare.Application.Abstractions;
using UniCare.Application.Exceptions;
using UniCare.Application.Features.Counseling.Dtos;
using UniCare.Domain.Entities;
using UniCare.Domain.Enums;

namespace UniCare.Application.Features.Counseling;

public class CounselingService(IApplicationDbContext db, IWellnessAssistant assistant) : ICounselingService
{
    public async Task<CounselingSessionDto> GetOrStartActiveSessionAsync(
        Guid studentId, CancellationToken cancellationToken = default)
    {
        var existing = await db.CounselingSessions
            .Where(s => s.StudentId == studentId && s.Status == CounselingSessionStatus.Active)
            .OrderByDescending(s => s.LastMessageAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing is not null)
        {
            return await GetOwnSessionDetailAsync(studentId, existing.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(CounselingSession), existing.Id);
        }

        var studentExists = await db.Students.AnyAsync(s => s.Id == studentId, cancellationToken);
        if (!studentExists)
        {
            throw new NotFoundException(nameof(Student), studentId);
        }

        var now = DateTimeOffset.UtcNow;
        var session = new CounselingSession { StudentId = studentId, StartedAt = now, LastMessageAt = now };
        db.CounselingSessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        return await GetOwnSessionDetailAsync(studentId, session.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(CounselingSession), session.Id);
    }

    public async Task<CounselingSessionDto> SendMessageAsync(
        Guid studentId, Guid sessionId, string content, CancellationToken cancellationToken = default)
    {
        var session = await db.CounselingSessions
            .Include(s => s.Messages.OrderBy(m => m.SentAt))
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.StudentId == studentId, cancellationToken)
            ?? throw new NotFoundException(nameof(CounselingSession), sessionId);

        if (session.Status == CounselingSessionStatus.Ended)
        {
            throw new ConflictException("This session has ended. Start a new one to keep talking.");
        }

        var trimmedContent = content.Trim();
        var now = DateTimeOffset.UtcNow;

        var history = session.Messages
            .Select(m => new WellnessAssistantMessage(m.Role == CounselingMessageRole.Student, m.Content))
            .ToList();

        db.CounselingMessages.Add(new CounselingMessage
        {
            CounselingSessionId = session.Id,
            Role = CounselingMessageRole.Student,
            Content = trimmedContent,
            SentAt = now,
        });

        var reply = await assistant.SendMessageAsync(history, trimmedContent, cancellationToken);

        db.CounselingMessages.Add(new CounselingMessage
        {
            CounselingSessionId = session.Id,
            Role = CounselingMessageRole.Assistant,
            Content = reply.Reply,
            SentAt = now,
        });

        session.LastMessageAt = now;

        // Once flagged, always flagged — a later calm message should not
        // un-flag a session staff may already be following up on.
        if (reply.CrisisFlagged && !session.CrisisFlagged)
        {
            session.CrisisFlagged = true;
            session.CrisisFlaggedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);

        return await GetOwnSessionDetailAsync(studentId, sessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(CounselingSession), sessionId);
    }

    public async Task<IReadOnlyList<CounselingSessionSummaryDto>> GetSessionsForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default) =>
        await db.CounselingSessions
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.StartedAt)
            .Select(SummaryProjection)
            .ToListAsync(cancellationToken);

    public async Task<CounselingSessionDto?> GetOwnSessionDetailAsync(
        Guid studentId, Guid sessionId, CancellationToken cancellationToken = default) =>
        await db.CounselingSessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.StudentId == studentId)
            .Select(DetailProjection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<CounselingSessionSummaryDto>> GetFlaggedSessionsAsync(
        CancellationToken cancellationToken = default) =>
        await db.CounselingSessions
            .AsNoTracking()
            .Where(s => s.CrisisFlagged)
            .OrderByDescending(s => s.CrisisFlaggedAt)
            .Select(SummaryProjection)
            .ToListAsync(cancellationToken);

    public async Task<CounselingSessionDto?> GetFlaggedSessionDetailAsync(
        Guid sessionId, CancellationToken cancellationToken = default) =>
        await db.CounselingSessions
            .AsNoTracking()
            .Where(s => s.Id == sessionId && s.CrisisFlagged)
            .Select(DetailProjection)
            .FirstOrDefaultAsync(cancellationToken);

    private static System.Linq.Expressions.Expression<Func<CounselingSession, CounselingSessionSummaryDto>>
        SummaryProjection => s => new CounselingSessionSummaryDto
        {
            Id = s.Id,
            StudentId = s.StudentId,
            StudentName = s.Student.FullName,
            StartedAt = s.StartedAt,
            LastMessageAt = s.LastMessageAt,
            Status = s.Status,
            CrisisFlagged = s.CrisisFlagged,
        };

    private static System.Linq.Expressions.Expression<Func<CounselingSession, CounselingSessionDto>>
        DetailProjection => s => new CounselingSessionDto
        {
            Id = s.Id,
            StudentId = s.StudentId,
            StudentName = s.Student.FullName,
            StartedAt = s.StartedAt,
            LastMessageAt = s.LastMessageAt,
            Status = s.Status,
            CrisisFlagged = s.CrisisFlagged,
            Messages = s.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new CounselingMessageDto
                {
                    Id = m.Id,
                    Role = m.Role,
                    Content = m.Content,
                    SentAt = m.SentAt,
                })
                .ToList(),
        };
}
