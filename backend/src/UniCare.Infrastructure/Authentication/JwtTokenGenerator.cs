using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace UniCare.Infrastructure.Authentication;

/// <summary>Turns a signed-in user and their roles into a bearer token.</summary>
public class JwtTokenGenerator(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _options = options.Value;

    public (string Token, DateTimeOffset ExpiresAtUtc) Generate(ApplicationUser user, IEnumerable<string> roles)
    {
        var expires = DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes);

        List<Claim> claims =
        [
            // ClaimTypes.NameIdentifier rather than the JWT-standard "sub", so
            // controllers can read it back with the ordinary
            // User.FindFirstValue(ClaimTypes.NameIdentifier) regardless of how the
            // bearer handler's inbound claim mapping is configured.
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("full_name", user.FullName),
            .. roles.Select(role => new Claim(ClaimTypes.Role, role)),
        ];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), new DateTimeOffset(expires, TimeSpan.Zero));
    }
}
