function Svg({ children, filled = false, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HeartIcon = ({ filled, ...props }) => (
  <Svg filled={filled} {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

export const BagIcon = (props) => (
  <Svg {...props}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </Svg>
);

export const CartPlusIcon = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.6 12.2a1.5 1.5 0 001.5 1.2h8.7a1.5 1.5 0 001.5-1.1L21 8H6.2" />
    <path d="M13 9.5v4M11 11.5h4" />
  </Svg>
);

export const SearchIcon = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7.5" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </Svg>
);

export const ArrowRightIcon = (props) => (
  <Svg {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </Svg>
);

export const ArrowLeftIcon = (props) => (
  <Svg {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </Svg>
);

export const ChevronDownIcon = (props) => (
  <Svg {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const PauseIcon = (props) => (
  <Svg {...props}>
    <line x1="9" y1="5" x2="9" y2="19" />
    <line x1="15" y1="5" x2="15" y2="19" />
  </Svg>
);

export const PlayIcon = (props) => (
  <Svg filled {...props}>
    <polygon points="7 4 20 12 7 20 7 4" />
  </Svg>
);

export const TruckIcon = (props) => (
  <Svg {...props}>
    <rect x="1" y="5" width="14" height="11" rx="1" />
    <path d="M15 9h4l3 3v4h-7z" />
    <circle cx="6" cy="18.5" r="1.8" />
    <circle cx="18" cy="18.5" r="1.8" />
  </Svg>
);

export const ReturnIcon = (props) => (
  <Svg {...props}>
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 00-4-4H4" />
  </Svg>
);

export const LockIcon = (props) => (
  <Svg {...props}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </Svg>
);

export const ShieldIcon = (props) => (
  <Svg {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </Svg>
);

export const MenuIcon = (props) => (
  <Svg {...props}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </Svg>
);

export const CloseIcon = (props) => (
  <Svg {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Svg>
);

export const FilterIcon = (props) => (
  <Svg {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </Svg>
);
