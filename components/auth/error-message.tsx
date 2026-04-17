export function ErrorMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-500">{message}</p>;
}
