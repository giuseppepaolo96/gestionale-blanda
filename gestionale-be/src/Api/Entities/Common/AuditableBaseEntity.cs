namespace Api.Entities.Common;

public class AuditableBaseEntity<TId> : BaseEntity<TId>, IAuditableBaseEntity
{
    protected AuditableBaseEntity()
    {
        
    }
    
    protected AuditableBaseEntity(TId id)
        : base(id)
    {
        
    }
    
    public string CreatedBy { get;  set; }
    public DateTimeOffset Created { get;  set; }
    public string? LastModifiedBy { get;  set; }
    public DateTimeOffset? LastModified { get;  set; }
}