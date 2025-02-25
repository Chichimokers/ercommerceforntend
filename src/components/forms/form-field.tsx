export const FormField = ({ label, className, error, children }: {
    label: string;
    className?: string;
    error?: string;
    children: React.ReactNode
}) => (
    <div className={`${className} flex flex-col gap-1`}>
        <label className="text-sm font-medium">{label}</label>
        {children}
        {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
);