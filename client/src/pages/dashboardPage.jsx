import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Copy, FileLock2, FileText, KeyRound, Loader2, LogIn, ShieldCheck, UserRound, Users, Clock3 } from 'lucide-react';
import { roomApi } from '../services/roomApi';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Unavailable');
const formatSize = (bytes = 0) => `${(bytes / 1024).toFixed(bytes > 1024 ? 1 : 0)} KB`;

export default function DashboardPage() {
  const { roomId: routeRoomId } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(routeRoomId || '');
  const [room, setRoom] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(Boolean(routeRoomId));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!routeRoomId) return;
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError('');
        const [roomResponse, filesResponse] = await Promise.all([roomApi.getRoom(routeRoomId), roomApi.getFiles(routeRoomId)]);
        setRoom(roomResponse.room);
        setFiles(filesResponse.files || []);
      } catch (err) {
        setRoom(null);
        setFiles([]);
        setError(err.response?.data?.error || 'That room could not be found or is no longer active.');
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [routeRoomId]);

  const handleLookup = (event) => {
    event.preventDefault();
    const cleanRoomId = roomId.trim().toUpperCase();
    if (cleanRoomId) navigate(`/dashboard/${cleanRoomId}`);
  };

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/join/${room.roomId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-canvas-black px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
          <Link to="/" className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-mint text-canvas-black"><ShieldCheck className="h-5 w-5" /></div><span className="text-xl font-bold tracking-tight text-text-primary">CipherVault</span></Link>
          <div className="flex items-center gap-3"><Link to="/join" className="inline-flex items-center gap-2 px-3 py-2 text-mono text-text-secondary hover:text-text-primary"><LogIn className="h-4 w-4" /> Join room</Link><Link to="/create" className="inline-flex items-center gap-2 rounded-button bg-brand-mint px-4 py-2.5 text-mono text-canvas-black hover:bg-text-primary">Create room <ArrowRight className="h-4 w-4" /></Link></div>
        </header>

        {!routeRoomId ? <section className="mx-auto max-w-2xl py-24 text-center"><p className="text-mono text-brand-mint">ROOM DASHBOARD</p><h1 className="mt-5 text-display text-4xl text-text-primary sm:text-6xl">Your secure room, at a glance.</h1><p className="mx-auto mt-6 max-w-xl text-body text-text-secondary">Enter a room code to see its status, access details, expiry, participants, and encrypted files.</p><form onSubmit={handleLookup} className="mx-auto mt-10 flex max-w-lg gap-2 rounded-xl border border-surface-border bg-surface-slate p-2"><input value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="ROOM CODE" className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm uppercase tracking-widest text-text-primary outline-none placeholder:text-text-muted" /><button className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-5 py-3 text-mono text-canvas-black hover:bg-brand-mint">Open <ArrowRight className="h-4 w-4" /></button></form></section> : loading ? <div className="flex min-h-[60vh] items-center justify-center gap-3 text-mono text-brand-mint"><Loader2 className="h-5 w-5 animate-spin" /> Loading room</div> : error ? <section className="mx-auto max-w-xl py-24 text-center"><div className="rounded-2xl border border-semantic-danger/40 bg-surface-slate p-8"><p className="text-mono text-semantic-danger">ACCESS UNAVAILABLE</p><p className="mt-4 text-body text-text-secondary">{error}</p><Link to="/dashboard" className="mt-6 inline-flex rounded-button bg-text-primary px-5 py-3 text-mono text-canvas-black">Try another room</Link></div></section> : <>
          <section className="grid gap-8 py-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end"><div><p className="text-mono text-brand-mint">ACTIVE ROOM / {room.roomId}</p><h1 className="mt-4 text-display text-4xl text-text-primary sm:text-6xl">{room.roomName || 'Secure room'}</h1><p className="mt-5 max-w-2xl text-body text-text-secondary">A temporary CipherVault room for sharing encrypted material without permanent accounts or exposed plaintext.</p></div><div className="rounded-2xl border border-brand-mint/30 bg-brand-mint/10 p-5"><div className="flex items-center gap-2 text-mono text-brand-mint"><span className="h-2 w-2 animate-pulse rounded-full bg-brand-mint" /> {room.status || 'ACTIVE'}</div><p className="mt-4 text-sm text-text-secondary">Expires {formatDate(room.expiresAt)}</p></div></section>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[UserRound, 'OWNER', room.ownerName || 'Room owner'], [Users, 'CAPACITY', `${room.maxParticipants} participants`], [FileLock2, 'ENCRYPTED ITEMS', `${files.length} shared items`], [Clock3, 'CREATED', formatDate(room.createdAt)]].map(([Icon, label, value]) => <div key={label} className="border border-surface-border bg-surface-slate p-5"><Icon className="h-5 w-5 text-brand-mint" /><p className="mt-6 text-mono text-text-muted">{label}</p><p className="mt-2 truncate text-body text-text-primary">{value}</p></div>)}</section>
          <section className="grid gap-8 py-8 lg:grid-cols-[1fr_0.8fr]"><div className="border border-surface-border bg-surface-slate p-6"><div className="flex items-center justify-between gap-4 border-b border-surface-border pb-5"><div><p className="text-mono text-brand-mint">ROOM ACCESS</p><p className="mt-2 text-body text-text-secondary">Share the room link with your team.</p></div><KeyRound className="h-6 w-6 text-brand-mint" /></div><div className="mt-6 flex items-center justify-between gap-4 border border-surface-border bg-canvas-black p-4"><span className="font-mono text-xl tracking-[0.2em] text-text-primary">{room.roomId}</span><button onClick={copyRoomLink} className="inline-flex items-center gap-2 text-mono text-brand-mint">{copied ? 'Copied' : 'Copy link'} <Copy className="h-4 w-4" /></button></div><Link to={`/join/${room.roomId}`} className="mt-4 inline-flex items-center gap-2 text-mono text-text-secondary hover:text-text-primary">Open secure room <ArrowRight className="h-4 w-4" /></Link></div><div className="border border-surface-border bg-surface-slate p-6"><p className="text-mono text-brand-mint">ENCRYPTED CONTENT</p><div className="mt-5 space-y-3">{files.length ? files.map((file) => <div key={file._id} className="flex items-center justify-between gap-3 border-b border-surface-border py-3"><div className="flex min-w-0 items-center gap-3"><FileText className="h-4 w-4 shrink-0 text-brand-mint" /><span className="truncate text-sm text-text-primary">{file.fileName}</span></div><span className="shrink-0 text-mono text-text-muted">{formatSize(file.size)}</span></div>) : <p className="py-6 text-body text-text-secondary">No encrypted items have been shared yet.</p>}</div></div></section>
        </>}
      </div>
    </main>
  );
}