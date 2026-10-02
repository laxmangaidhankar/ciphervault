import React from 'react';
import { Users, Crown, Circle } from 'lucide-react';

export const MembersPanel = ({ members }) => {


  return (
    <aside className="flex flex-col h-full bg-canvas-black overflow-hidden">

      <div className="p-3  h-16 border-b border-surface-border bg-surface-elevated">

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-mint" />

          <h3 className="text-mono text-text-primary text-sm">
            ROOM MEMBERS
          </h3>
        </div>

        <p className="text-xs text-text-muted mt-2">
          {members.length} members in this room
        </p>

      </div>


      <div className="flex-1 overflow-y-auto p-3">

        <div className="flex flex-col gap-1">

          {members.map((member) => (

            <div
              key={member.participantId}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors"
            >

              {/* Avatar */}
              <div className="relative shrink-0">

                <div
                  className="w-9 h-9 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-sm font-mono text-text-primary"
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>



              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2">

                  <p className="text-sm text-text-primary truncate">
                    {member.displayName}
                  </p>

                </div>

                <div className="flex items-center gap-1.5 mt-0.5">

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="p-5 border-t border-surface-border bg-surface-elevated">
        <p className="text-[12px] text-text-muted mt-2">
          Members can access shared environment variables

        </p>

      </div>

    </aside>
  );
};

