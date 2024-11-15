namespace Api.Entities.Common;

public class BaseEntity<TId>
{
    protected BaseEntity()
    {
        
    }
    
    protected BaseEntity(TId id)
    {
        Id = id;
    }
    
    public TId Id { get; private set; }
}