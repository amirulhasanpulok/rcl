import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={clsx('rounded-lg border bg-card text-card-foreground shadow', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={clsx('flex flex-col space-y-1.5 p-6', className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h2 className={clsx('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }: CardProps) {
  return <p className={clsx('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function CardContent({ className, children }: CardProps) {
  return <div className={clsx('p-6 pt-0', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <div className={clsx('flex items-center p-6 pt-0', className)}>{children}</div>
  );
}
