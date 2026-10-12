/// Usuario público de Users, sin credenciales.
class Usuario {
  final int idUsuario;
  final String nombres;
  final String apellidos;
  final String codigo;
  final String correo;
  final String escuela;
  final int ciclo;
  final String createdAt;
  final String? role;
  bool get isStudent => role == 'ESTUDIANTE';
  static const studentAccessMessage =
      'El acceso a la aplicación móvil está restringido a estudiantes.';

  const Usuario({
    required this.idUsuario,
    required this.nombres,
    required this.apellidos,
    required this.codigo,
    required this.correo,
    required this.escuela,
    required this.ciclo,
    required this.createdAt,
    required this.role,
  });

  String get nombre => '$nombres $apellidos'.trim();
}
