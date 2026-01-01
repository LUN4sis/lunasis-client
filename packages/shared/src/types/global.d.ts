// Type declarations for Node.js globals that may or may not be available at runtime
// This allows the shared package to be used in both Node.js and browser/React Native environments

declare const process:
  | {
      env: {
        NODE_ENV?: string;
        NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;
        [key: string]: string | undefined;
      };
    }
  | undefined;

interface ErrorConstructor {
  captureStackTrace?(targetObject: object, constructorOpt?: Function): void;
}
