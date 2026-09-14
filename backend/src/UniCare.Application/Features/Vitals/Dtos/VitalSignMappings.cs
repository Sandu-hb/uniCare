using System.Linq.Expressions;
using UniCare.Domain.Entities;

namespace UniCare.Application.Features.Vitals.Dtos;

public static class VitalSignMappings
{
    public static Expression<Func<VitalSign, VitalSignDto>> Projection =>
        vital => new VitalSignDto
        {
            Id = vital.Id,
            MedicalVisitId = vital.MedicalVisitId,
            RecordedByStaffId = vital.RecordedByStaffId,
            RecordedByStaffName = vital.RecordedByStaff.FullName,
            TemperatureCelsius = vital.TemperatureCelsius,
            SystolicBp = vital.SystolicBp,
            DiastolicBp = vital.DiastolicBp,
            PulseBpm = vital.PulseBpm,
            HeightCm = vital.HeightCm,
            WeightKg = vital.WeightKg,
            Observations = vital.Observations,
            RecordedAt = vital.RecordedAt,
        };
}
