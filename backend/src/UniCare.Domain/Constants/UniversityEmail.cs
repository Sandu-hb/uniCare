namespace UniCare.Domain.Constants;

/// <summary>
/// Mirrors the frontend's isUniversityEmail check (frontend/src/features/auth/validation.ts).
/// Client-side validation is a convenience, not a control — the API must reject
/// the same addresses independently.
/// </summary>
public static class UniversityEmail
{
    public const string Domain = "uom.lk";

    public static bool IsValid(string email)
    {
        var at = email.LastIndexOf('@');
        if (at < 0) return false;

        return email[(at + 1)..].Equals(Domain, StringComparison.OrdinalIgnoreCase);
    }
}
