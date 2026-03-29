import React, { useState } from "react";
import { UserCard, SearchBar, UserCardGrid } from "../components/UserCard";

const UserDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const users = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
  }));

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center px-4 py-8"
      style={{ background: "#CFCFCF" }}
    >
      <div className="w-full max-w-[412px] flex flex-col items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users..."
          className="mb-[116px]"
        />

        <UserCardGrid>
          {users.map((user) => (
            <UserCard
              key={user.id}
              onClick={() => console.log(`User ${user.id} clicked`)}
            />
          ))}
        </UserCardGrid>
      </div>
    </div>
  );
};

export default UserDirectory;
