import React from 'react';
import { Users, Crown, Circle } from 'lucide-react';

export const MembersPanel = () => {

  // Temporary members.
  // Later this data will come from Socket.io.
  const members = [
    {
      id: 1,
      name: 'Laxman',
      role: 'Owner',
      online: true,
      isCurrentUser: true,
    },
    {
      id: 2,
      name: 'Rahul',
      role: 'Editor',
      online: true,
      isCurrentUser: false,
    },
    {
      id: 3,
      name: 'Aditya',
      role: 'Viewer',
      online: false,
      isCurrentUser: false,
    },
  ];

  const onlineMembers = members.filter(
    (member) => member.online
  ).length;

  return (
    <aside className="flex flex-col h-full bg-canvas-black overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-surface-border bg-surface-elevated">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Users className="w-4 h-4 text-brand-mint" />

            <h3 className="text-mono text-text-primary text-sm">
              ROOM MEMBERS
            </h3>

          </div>

          <span className="text-xs text-brand-mint font-mono">
            {onlineMembers} online
          </span>

        </div>

        <p className="text-xs text-text-muted mt-2">
          {members.length} members in this room
        </p>

      </div>


      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-3">

        <div className="flex flex-col gap-1">

          {members.map((member) => (

            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors"
            >

              {/* Avatar */}
              <div className="relative flex-shrink-0">

                <div
                  className="w-9 h-9 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-sm font-mono text-text-primary"
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* Online indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-canvas-black ${
                    member.online
                      ? 'bg-brand-mint'
                      : 'bg-text-muted'
                  }`}
                />

              </div>


              {/* Member Information */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2">

                  <p className="text-sm text-text-primary truncate">
                    {member.name}
                  </p>

                  {member.isCurrentUser && (
                    <span className="text-[9px] text-brand-mint font-mono">
                      YOU
                    </span>
                  )}

                </div>

                <div className="flex items-center gap-1.5 mt-0.5">

                  {member.role === 'Owner' && (
                    <Crown className="w-3 h-3 text-brand-mint" />
                  )}

                  <span className="text-[11px] text-text-muted">
                    {member.role}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* Room Status */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated">

        <div className="flex items-center gap-2">

          <Circle className="w-2.5 h-2.5 fill-brand-mint text-brand-mint" />

          <span className="text-xs text-text-muted font-mono">
            ROOM ACTIVE
          </span>

        </div>

        <p className="text-[10px] text-text-muted mt-2">
          Members can access shared environment variables
          according to their role.
        </p>

      </div>

    </aside>
  );
};

