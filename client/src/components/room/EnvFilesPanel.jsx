import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Download,
  Upload,
  Lock,
  MoreVertical,
} from "lucide-react";

import {
  fetchEncryptedEnv,
  saveEncryptedEnv,
} from "../../services/envApi";

import { encryptData } from "../../crypto/encryptData";
import { decryptData } from "../../crypto/decryptData";

import {
  requireRoomEncryptionKey,
} from "../../crypto/roomKeyManager";


export const EnvFilesPanel = ({ room, roomKeyReady, envVersion }) => {
  const roomId = room?.roomId;

  const [variables, setVariables] = useState([]);
  const [visibleVariables, setVisibleVariables] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleVisibility = (id) => {
    setVisibleVariables((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const loadEnv = async () => {
      const start = performance.now();

      if (!roomId) {
        setError("Room ID is missing.");
        setIsLoading(false);
        return;
      }

      if (!roomKeyReady) {
        console.log("[ENV] Waiting for Room Key...");
        return;
      }

      try {
        console.log("[ENV] Loading started");

        setIsLoading(true);
        setError("");

        console.log("[ENV] Getting room key...");
        const keyStart = performance.now();

        const roomKey =
          await requireRoomEncryptionKey(roomId);

        console.log(
          `[ENV] Room key ready: ${(performance.now() - keyStart).toFixed(0)}ms`
        );

        console.log("[ENV] Fetching encrypted ENV...");
        const fetchStart = performance.now();

        const response =
          await fetchEncryptedEnv(roomId);

        console.log(
          `[ENV] API completed: ${(performance.now() - fetchStart).toFixed(0)}ms`
        );

        console.log("[ENV] Decrypting...");
        const decryptStart = performance.now();

        const decryptedJson =
          await decryptData(
            response.encryptedEnv,
            roomKey
          );

        console.log(
          `[ENV] Decryption completed: ${(performance.now() - decryptStart).toFixed(0)}ms`
        );

        const decryptedVariables =
          JSON.parse(decryptedJson);

        setVariables(decryptedVariables);

        console.log(
          `[ENV] TOTAL: ${(performance.now() - start).toFixed(0)}ms`
        );

      } catch (error) {

        if (error.status === 404) {
          console.log("[ENV] No ENV data found yet.");
          setVariables([]);
          return;
        }

        console.error(
          "[ENV] Failed to load ENV:",
          error
        );

        setError(
          error.message ||
          "Failed to load ENV data."
        );

      } finally {
        setIsLoading(false);
      }
    };

    loadEnv();
  }, [roomId, roomKeyReady, envVersion]);





  const addVariable = async (e) => {
    e.preventDefault();

    const key = newKey.trim();
    const value = newValue.trim();

    if (!key || !value || !roomId) return;

    try {
      setIsSaving(true);
      setError("");

      // 1. Get the Room AES key from IndexedDB
      const roomKey =
        await requireRoomEncryptionKey(roomId);

      // 2. Create the new variable
      const newVariable = {
        id: Date.now(),
        key: key.toUpperCase(),
        value,
      };

      // 3. Create the updated ENV in browser memory
      const updatedVariables = [
        ...variables,
        newVariable,
      ];

      // 4. Encrypt the complete ENV
      const encryptedEnv =
        await encryptData(
          JSON.stringify(updatedVariables),
          roomKey
        );

      console.log("[ENV] Encrypting updated ENV");

      // 5. Send ONLY encrypted data to backend
      await saveEncryptedEnv(
        roomId,
        encryptedEnv
      );

      console.log("[ENV] Encrypted ENV saved");

      // 6. Update UI only after server save succeeds
      setVariables(updatedVariables);

      // 7. Reset form
      setNewKey("");
      setNewValue("");
      setIsAdding(false);

    } catch (error) {
      console.error(
        "[ENV] Failed to add variable:",
        error
      );

      setError(
        error.message ||
        "Failed to save variable."
      );

    } finally {
      setIsSaving(false);
    }
  };

  const deleteVariable = async (id) => {
    if (!roomId) {
      setError("Room ID is missing.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      console.log("[ENV] Deleting variable:", id);

      // Get the existing Room AES key
      const roomKey =
        await requireRoomEncryptionKey(roomId);

      // Remove the variable from the current ENV list
      const updatedVariables = variables.filter(
        (variable) => variable.id !== id
      );

      console.log(
        "[ENV] Variables after deletion:",
        updatedVariables
      );

      // Encrypt the updated complete ENV list
      const encryptedEnv =
        await encryptData(
          JSON.stringify(updatedVariables),
          roomKey
        );

      console.log(
        "[ENV] Saving encrypted ENV after deletion"
      );

      // Replace the encrypted ENV stored in Redis
      await saveEncryptedEnv(
        roomId,
        encryptedEnv
      );

      console.log(
        "[ENV] ENV deletion persisted successfully"
      );

      // Update current user's UI immediately
      setVariables(updatedVariables);

      // Remove visibility state for deleted variable
      setVisibleVariables((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

    } catch (error) {
      console.error(
        "[ENV] Failed to delete variable:",
        error
      );

      setError(
        error.message ||
        "Failed to delete variable."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVariables = variables.filter((variable) =>
    variable.key.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (


    <main className="flex flex-col h-full min-w-0 bg-canvas-black overflow-hidden">


      <div className="shrink-0 p-3 h-16 border-b border-surface-border bg-surface-elevated">

        <div className="flex items-center justify-between gap-4">

          {/* File information */}
          <div className="  border-b border-surface-border flex items-center bg-surface-elevated">
            <div>
              <p className="text-xs text-text-muted ">
                Shared environment variables
              </p>
            </div>
          </div>


          {/* Actions */}
          <div className="flex items-center gap-2">



            <button
              type="button"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-button border border-surface-border text-xs text-text-secondary hover:text-text-primary hover:border-brand-mint transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>



          </div>

        </div>

      </div>


      {/* =====================================================
          TOOLBAR
      ====================================================== */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-surface-border">

        <div className="flex items-center justify-between gap-3">

          {/* Search */}
          <div className="relative flex-1 max-w-md">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={15}
            />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search variables..."
              className="w-full bg-canvas-black border border-surface-border rounded-button py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors"
            />

          </div>


          {/* Variable count */}
          <span className="hidden sm:block text-xs text-text-muted font-mono whitespace-nowrap">
            {variables.length} variables
          </span>

        </div>

      </div>

      {error && (
        <div className="mx-5 mt-3 border border-red-500/30 bg-red-500/10 rounded-button px-3 py-2">
          <p className="text-xs text-red-400">
            {error}
          </p>
        </div>
      )}


      {/* =====================================================
          VARIABLES
      ====================================================== */}
      {/* =====================================================
    VARIABLES
====================================================== */}
      <div className="flex-1 overflow-y-auto p-5">

        {isLoading ? (

          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-text-muted">
              Loading environment variables...
            </p>
          </div>

        ) : (

          <div className="flex flex-col gap-3">

            {/* Empty state */}
            {filteredVariables.length === 0 && !isAdding && (

              <div className="py-12 flex items-center justify-center">

                <div className="text-center">

                  <div className="w-12 h-12 mx-auto rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center">
                    <Search className="w-5 h-5 text-text-muted" />
                  </div>

                  <h3 className="text-sm text-text-primary mt-4">
                    No variables found
                  </h3>

                  <p className="text-xs text-text-muted mt-1">
                    Try another search or add a new variable.
                  </p>

                </div>

              </div>

            )}

            {/* Existing variables */}
            {filteredVariables.map((variable) => (

              <div
                key={variable.id}
                className="group border border-surface-border rounded-card bg-surface-elevated hover:border-brand-console transition-colors"
              >

                <div className="p-4">

                  {/* Variable header */}
                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                        Variable
                      </p>

                      <p className="text-sm text-text-primary font-mono mt-1 truncate">
                        {variable.key}
                      </p>

                    </div>

                    {/* Row actions */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">

                      <button
                        type="button"
                        className="p-2 text-text-muted hover:text-brand-mint transition-colors"
                        title="Edit variable"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete "${variable.key}"?\n\n` +
                            `This will remove it for everyone in this room.`
                          );

                          if (confirmed) {
                            deleteVariable(variable.id);
                          }
                        }}
                        disabled={isSaving}
                        title="Delete variable"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                  {/* Value */}
                  <div className="relative mt-3">

                    <input
                      type={
                        visibleVariables[variable.id]
                          ? "text"
                          : "password"
                      }
                      value={variable.value}
                      readOnly
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 pl-3 pr-10 text-xs text-text-secondary font-mono focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => toggleVisibility(variable.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-brand-mint transition-colors"
                      title={
                        visibleVariables[variable.id]
                          ? "Hide value"
                          : "Show value"
                      }
                    >
                      {visibleVariables[variable.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                  </div>

                </div>

              </div>

            ))}

            {/* Add Variable button */}
            {!isAdding && (

              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full border border-dashed border-surface-border rounded-card p-5 flex items-center justify-center gap-2 text-xs text-text-muted hover:text-brand-mint hover:border-brand-console transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </button>

            )}

            {/* Add Variable form */}
            {isAdding && (

              <form
                onSubmit={addVariable}
                className="border border-brand-console rounded-card bg-surface-elevated p-4"
              >

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <p className="text-sm text-text-primary">
                      Add Variable
                    </p>

                    <p className="text-[11px] text-text-muted mt-1">
                      Add a new environment variable to this room.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <div>

                    <label className="block text-[10px] text-text-muted font-mono uppercase mb-1.5">
                      Variable Name
                    </label>

                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="DATABASE_URL"
                      autoFocus
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 px-3 text-xs text-text-primary font-mono placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                    />

                  </div>


                  <div>

                    <label className="block text-[10px] text-text-muted font-mono uppercase mb-1.5">
                      Value
                    </label>

                    <input
                      type="password"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full bg-canvas-black border border-surface-border rounded-button py-2.5 px-3 text-xs text-text-primary font-mono placeholder:text-text-secondary focus:outline-none focus:border-brand-mint"
                    />

                  </div>

                </div>


                <div className="flex justify-end mt-4">

                  <button
                    type="submit"
                    disabled={
                      !newKey.trim() ||
                      !newValue.trim() ||
                      isSaving
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-button bg-brand-mint text-canvas-black text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />

                    {isSaving ? "Saving..." : "Add Variable"}
                  </button>

                </div>

              </form>

            )}


          </div>

        )}

      </div>


    </main>
  );
};

