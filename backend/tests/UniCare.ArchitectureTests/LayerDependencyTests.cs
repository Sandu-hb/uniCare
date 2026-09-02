using System.Reflection;
using FluentAssertions;
using NetArchTest.Rules;

namespace UniCare.ArchitectureTests;

/// <summary>
/// Turns the Clean Architecture dependency rule into tests that fail the build.
/// Folder structure is a convention; these are the enforcement.
/// </summary>
public class LayerDependencyTests
{
    private const string DomainNamespace = "UniCare.Domain";
    private const string ApplicationNamespace = "UniCare.Application";
    private const string InfrastructureNamespace = "UniCare.Infrastructure";
    private const string ApiNamespace = "UniCare.Api";

    private static readonly Assembly DomainAssembly = typeof(Domain.IDomainAssemblyMarker).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(Application.DependencyInjection).Assembly;
    private static readonly Assembly InfrastructureAssembly = typeof(Infrastructure.DependencyInjection).Assembly;

    [Fact]
    public void Domain_Should_Not_DependOn_AnyOtherLayer()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should()
            .NotHaveDependencyOnAny(ApplicationNamespace, InfrastructureNamespace, ApiNamespace)
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            "Domain is the innermost layer and must depend on nothing. Offenders: {0}",
            string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Domain_Should_Not_DependOn_EntityFrameworkCore()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should()
            .NotHaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            "entities must not know how they are persisted. Offenders: {0}",
            string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_Should_Not_DependOn_Infrastructure_Or_Api()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should()
            .NotHaveDependencyOnAny(InfrastructureNamespace, ApiNamespace)
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            "business logic must not depend on EF Core or HTTP. Offenders: {0}",
            string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_Should_Not_DependOn_DatabaseProvider()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should()
            .NotHaveDependencyOn("Npgsql")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            "Application may query through EF Core abstractions, but must never know which "
            + "database it is talking to. Offenders: {0}",
            string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Infrastructure_Should_Not_DependOn_Api()
    {
        var result = Types.InAssembly(InfrastructureAssembly)
            .Should()
            .NotHaveDependencyOn(ApiNamespace)
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            "Infrastructure sits below the web layer. Offenders: {0}",
            string.Join(", ", result.FailingTypeNames ?? []));
    }
}
