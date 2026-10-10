import '../../domain/entities/usuario.dart';

/// DTO (Data Transfer Object) para serializar/deserializar Usuario.
///
/// Esta clase maneja la conversión desde/hacia JSON,
/// y puede convertirse a la entidad de dominio Usuario.
class UsuarioModel {
  final int idUsuario;
  final String nombre;
  final String correo;
  final String? facultad;
  final int? ciclo;
  final String rol;

  UsuarioModel({
    required this.idUsuario,
    required this.nombre,
    required this.correo,
    this.facultad,
    this.ciclo,
    required this.rol,
  });

  /// Crea un DTO desde JSON (respuesta de la API)
  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      idUsuario: json['id_usuario'] ?? 0,
      nombre: json['nombre'] ?? '',
      correo: json['correo'] ?? '',
      facultad: json['facultad'],
      ciclo: json['ciclo'],
      rol: json['rol'] ?? 'Estudiante',
    );
  }

  /// Convierte el DTO a entidad de dominio
  Usuario toEntity() {
    return Usuario(
      idUsuario: idUsuario,
      nombre: nombre,
      correo: correo,
      facultad: facultad,
      ciclo: ciclo,
      rol: rol,
    );
  }

  /// Crea un DTO desde una entidad de dominio
  factory UsuarioModel.fromEntity(Usuario usuario) {
    return UsuarioModel(
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      facultad: usuario.facultad,
      ciclo: usuario.ciclo,
      rol: usuario.rol,
    );
  }

  /// Convierte el DTO a JSON (para enviar a la API)
  Map<String, dynamic> toJson() {
    return {
      'id_usuario': idUsuario,
      'nombre': nombre,
      'correo': correo,
      'facultad': facultad,
      'ciclo': ciclo,
      'rol': rol,
    };
  }
}
