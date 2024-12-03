using Api.Commons.Models;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace Api.Commons.Extensions;

public static class PaginatedListExtensions
{
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(this IQueryable<TDestination> queryable, int pageNumber, int pageSize, CancellationToken ct = default) where TDestination : class
        => PaginatedList<TDestination>.CreateAsync(queryable.AsNoTracking(), pageNumber, pageSize, ct);
    
    public static Task<PaginatedList<TDestination>> PaginatedListProjectToAsync<TSource, TDestination>(this IQueryable<TSource> queryable, int pageNumber, int pageSize, AutoMapper.IConfigurationProvider configuration, CancellationToken ct = default) where TDestination : class
        => PaginatedList<TDestination>.CreateAsync(queryable.ProjectTo<TDestination>(configuration).AsNoTracking(), pageNumber, pageSize, ct);
    
    public static Task<List<TDestination>> ProjectToListAsync<TDestination>(this IQueryable queryable, AutoMapper.IConfigurationProvider configuration, CancellationToken ct = default) where TDestination : class
        => queryable.ProjectTo<TDestination>(configuration).AsNoTracking().ToListAsync(ct);
}