namespace Api.Entities.Common;

public interface IAuditableBaseEntity
{
    string CreatedBy { get;  set; }
    DateTimeOffset Created { get;  set; }
    string? LastModifiedBy { get;  set; }
    DateTimeOffset? LastModified { get;  set; }
}