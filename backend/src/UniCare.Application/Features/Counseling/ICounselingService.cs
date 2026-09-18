using UniCare.Application.Features.Counseling.Dtos;

namespace UniCare.Application.Features.Counseling;

public interface ICounselingService
{
    /// <summary>Resumes the student's Active session if one exists, otherwise starts a new one.</summary>
    Task<CounselingSessionDto> GetOrStartActiveSessionAsync(
        Guid studentId, CancellationToken cancellationToken = default);

    /// <exception cref="Exceptions.NotFoundException">No such session for this student.</exception>
    /// <exception cref="Exceptions.ConflictException">The session has already ended.</exception>
    Task<CounselingSessionDto> SendMessageAsync(
        Guid studentId, Guid sessionId, string content, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CounselingSessionSummaryDto>> GetSessionsForStudentAsync(
        Guid studentId, CancellationToken cancellationToken = default);

    /// <summary>Null if no session with this id belongs to this student.</summary>
    Task<CounselingSessionDto?> GetOwnSessionDetailAsync(
        Guid studentId, Guid sessionId, CancellationToken cancellationToken = default);

    /// <summary>Admin-facing: every session ever flagged for crisis indicators, newest first.</summary>
    Task<IReadOnlyList<CounselingSessionSummaryDto>> GetFlaggedSessionsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>Null if this session was never flagged — Admin can never browse ordinary sessions.</summary>
    Task<CounselingSessionDto?> GetFlaggedSessionDetailAsync(
        Guid sessionId, CancellationToken cancellationToken = default);
}
