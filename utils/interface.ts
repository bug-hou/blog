export interface IEnvConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  server: {
    host: string;
    port: number;
  };
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  logging: {
    level: string;
    file: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    enabled: boolean;
    origin: string;
  };
  mail: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    }
  };
  cos: {
    SecretId: string;
    SecretKey: string;
    Bucket: string;
    Region: string;
    Expires: number;
  };
}