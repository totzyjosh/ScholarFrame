import React from 'react';
import { LucideProps } from 'lucide-react';

interface PlaceholderViewProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  message?: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  icon: Icon,
  title,
  message = "This feature is currently under development and will be available soon."
}) => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center text-center p-8 bg-slate-50">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-light mb-6">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-slate-logo mb-2">{title}</h1>
      <p className="max-w-md text-muted-foreground">{message}</p>
    </div>
  );
};

export default PlaceholderView;