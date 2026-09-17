using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using UniCare.Application.Features.Appointments;
using UniCare.Application.Features.Consultations;
using UniCare.Application.Features.Laboratory;
using UniCare.Application.Features.MedicalDocuments;
using UniCare.Application.Features.MedicalProfiles;
using UniCare.Application.Features.Medicines;
using UniCare.Application.Features.Pharmacy;
using UniCare.Application.Features.Students;
using UniCare.Application.Features.Visits;

namespace UniCare.Application;

/// <summary>
/// Registers the Application layer's own services. Mirrors
/// UniCare.Infrastructure.DependencyInjection so Program.cs reads as one line
/// per layer rather than a wall of registrations.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IMedicalProfileService, MedicalProfileService>();
        services.AddScoped<IMedicalDocumentService, MedicalDocumentService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IVisitService, VisitService>();
        services.AddScoped<IConsultationService, ConsultationService>();
        services.AddScoped<ILabOrderService, LabOrderService>();
        services.AddScoped<IPharmacyService, PharmacyService>();
        services.AddScoped<IMedicineService, MedicineService>();

        return services;
    }
}
