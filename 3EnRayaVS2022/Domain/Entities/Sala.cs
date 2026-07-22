namespace _3EnRaya.Domain.Entities
{
    public class Sala
    {
        public List<string> Conexiones { get; set; } = new List<string>();
        public string IdTurnoActual { get; set; }
        public bool EstaCompleta => Conexiones.Count >= 2;
    }
}