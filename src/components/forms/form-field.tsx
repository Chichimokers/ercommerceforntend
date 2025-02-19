export const FormField = ({ label, error, children }: {
    label: string;
    error?: string;
    children: React.ReactNode
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>
        {children}
        {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
);