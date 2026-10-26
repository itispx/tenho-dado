import Link from "next/link";

import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button/button";

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function ButtonLink({
  variant = "outline",
  size = "sm",
  fullWidth = false,
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link {...linkProps} className={buttonClasses({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}

export default ButtonLink;
