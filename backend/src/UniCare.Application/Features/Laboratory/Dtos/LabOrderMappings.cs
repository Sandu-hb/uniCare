using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Laboratory.Dtos;

public static class LabOrderMappings
{
    public static Expression<Func<LabOrder, LabOrderDto>> Projection =>
        order => new LabOrderDto
        {
            Id = order.Id,
            MedicalVisitId = order.MedicalVisitId,
            StudentId = order.MedicalVisit.StudentId,
            StudentName = order.MedicalVisit.Student.FullName,
            RequestDetails = order.RequestDetails,
            Status = order.Status,
            ResultNotes = order.ResultNotes,
            RequestedAt = order.RequestedAt,
            CompletedAt = order.CompletedAt,
        };
}
