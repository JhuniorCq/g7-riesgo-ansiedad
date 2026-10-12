class StoredSession {
  final String token;
  final String usersOrigin;
  final String? role;
  const StoredSession(this.token, this.usersOrigin, [this.role]);
}

abstract class SessionStore {
  Future<StoredSession?> read();
  Future<void> write(StoredSession session);
  Future<void> delete();
}
