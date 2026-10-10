/// Entidad de dominio que representa a un Usuario del sistema.
///
/// Esta es una entidad pura sin dependencias de serialización.
/// La conversión desde/hacia JSON se maneja en la capa Data (DTOs).
class Usuario {
  final int idUsuario;
  final String nombre;
  final String correo;
  final String? facultad;
  final int? ciclo;
  final String rol;

  Usuario({
    required this.idUsuario,
    required this.nombre,
    required this.correo,
    this.facultad,
    this.ciclo,
    required this.rol,
  });
}
