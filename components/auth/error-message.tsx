export function ErrorMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-3 text-xs text-red-500">{message}</p>;
}
