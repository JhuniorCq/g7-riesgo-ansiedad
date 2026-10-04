export interface UserProps {
  id?: number;
  names: string;
  surnames: string;
  code: string;
  email: string;
  password: string;
  createdAt: Date;
}

export class User {
  private id: number | undefined;
  private names: string;
  private surnames: string;
  private code: string;
  private email: string;
  private password: string;
  private createdAt: Date;

  constructor(props: UserProps) {
    this.validate(props);

    this.id = props.id;
    this.names = props.names;
    this.surnames = props.surnames;
    this.code = props.code;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt;
  }

  private validate(props: UserProps): void {}

  getId(): number | undefined {
    return this.id;
  }

  assignId(id: number): void {
    if (this.id) {
      throw new Error("El usuario ya tiene un ID asignado");
    }

    this.id = id;
  }

  getNames(): string {
    return this.names;
  }

  getSurnames(): string {
    return this.surnames;
  }

  getCode(): string {
    return this.code;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
