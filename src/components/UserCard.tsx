import React from "react";

interface UserCardProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  icon, 
  onClick,
  className = "" 
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full h-[157px] bg-[#D9D9D9] rounded-none flex items-center justify-center cursor-pointer ${className}`}
      style={{
        filter: "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))",
      }}
    >
      {icon || (
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_account)">
            <path
              d="M76 12H20C15.6 12 12 15.6 12 20V76C12 80.4 15.6 84 20 84H76C80.4 84 84 80.4 84 76V20C84 15.6 80.4 12 76 12ZM48 24C55.72 24 62 30.28 62 38C62 45.72 55.72 52 48 52C40.28 52 34 45.72 34 38C34 30.28 40.28 24 48 24ZM76 76H20V75.08C20 72.6 21.12 70.28 23.04 68.76C29.88 63.28 38.56 60 48 60C57.44 60 66.12 63.28 72.96 68.76C74.88 70.28 76 72.64 76 75.08V76Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_account">
              <rect width="96" height="96" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  );
};

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`w-full max-w-[333px] ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[43px] rounded-lg border-0 px-4 outline-none"
        style={{
          background: "rgba(228, 228, 228, 0.81)",
          opacity: 0.92,
          boxShadow: "-1px 1px 3px -8px rgba(73, 65, 65, 0.25)",
        }}
      />
    </div>
  );
};

interface UserCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const UserCardGrid: React.FC<UserCardGridProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-[14px] w-full max-w-[402px] ${className}`}
    >
      {children}
    </div>
  );
};

export default UserCard;
