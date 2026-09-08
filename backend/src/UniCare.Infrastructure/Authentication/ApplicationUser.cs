using Microsoft.AspNetCore.Identity;
using UniCare.Domain.Enums;

namespace UniCare.Infrastructure.Authentication;

/// <summary>
/// The Identity user backing sign-in. Deliberately holds nothing about academic
/// or clinical data — that lives on Student/Staff, which link back here by
/// ApplicationUserId. This class stays in Infrastructure, never Domain, which is
/// why Student/Staff can only reference it by a bare Guid.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public required string FullName { get; set; }

    public AccountStatus Status { get; set; } = AccountStatus.Active;
}
