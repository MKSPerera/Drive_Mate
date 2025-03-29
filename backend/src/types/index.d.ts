// This file contains type declarations for modules without proper type definitions

declare module 'bcrypt' {
  export function genSalt(rounds?: number): Promise<string>;
  export function hash(data: string, salt: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'passport-strategy' {
  export class Strategy {
    constructor();
    authenticate(req: any, options?: any): any;
  }
}

declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  
  export interface StrategyOptions {
    jwtFromRequest: (req: any) => string | null;
    secretOrKey: string;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }
  
  export interface VerifiedCallback {
    (error: any, user?: any, info?: any): void;
  }
  
  export interface VerifyCallback {
    (payload: any, done: VerifiedCallback): void;
  }
  
  export interface VerifyCallbackWithRequest {
    (req: any, payload: any, done: VerifiedCallback): void;
  }
  
  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback | VerifyCallbackWithRequest);
    authenticate(req: any, options?: any): any;
  }
  
  export namespace ExtractJwt {
    export function fromAuthHeaderAsBearerToken(): (req: any) => string | null;
    export function fromHeader(header_name: string): (req: any) => string | null;
    export function fromBodyField(field_name: string): (req: any) => string | null;
    export function fromUrlQueryParameter(param_name: string): (req: any) => string | null;
    export function fromExtractors(extractors: Array<(req: any) => string | null>): (req: any) => string | null;
  }
} 