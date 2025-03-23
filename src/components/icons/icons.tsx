export const GoogleIcon = ({
  height = 24,
  width = 24,
  className = "",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={width}
    height={height}
    className={className}
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

export const OutlineEmailIcon = ({
  height = 24,
  width = 24,
  className = "",
  color = "currentColor",
  strokeWidth = 2,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const SearchPlusIcon = ({
  height = 24,
  width = 24,
  className = "",
  color = "currentColor",
  strokeWidth = 2,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Círculo de la lupa */}
    <circle cx="11" cy="11" r="8" />
    {/* Líneas de la lupa */}
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    {/* Signo de más */}
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const SearchMinusIcon = ({
  height = 24,
  width = 24,
  className = "",
  color = "currentColor",
  strokeWidth = 2,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const VisaIcon = ({ height = 32, width = 32, color = "#142787", className = "" }) => {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 48 30"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="30" rx="4" fill="white" />
      <text x="8" y="20" fill={color} fontSize="14" fontWeight="bold">VISA</text>
    </svg>
  );
}

export const MastercardIcon = ({ height = 32, width = 32, className = "" }) => {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 48 30"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="30" rx="4" fill="white" />
      <circle cx="18" cy="15" r="10" fill="#EB001B" />
      <circle cx="30" cy="15" r="10" fill="#F79E1B" />
    </svg>
  );
}

export const PaypalIcon = ({ height = 32, width = 32, color = "#003087", className = "" }) => {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 48 30"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="30" rx="4" fill={color} />
      <text x="5" y="20" fill="white" fontSize="12" fontWeight="bold">PayPal</text>
    </svg>
  );
}