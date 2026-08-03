import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════
// RF-20: Navbar compartido con badge y dropdown de notificaciones.
// `subtitle` es el texto tras el logo (ej. "| Panel de Control").
// `children` es el contenido específico de la derecha de cada página
// (buscador + auth en Welcome, link de perfil en Dashboard, etc.)
// ═══════════════════════════════════════════════════════════════════
export default function Navbar({ subtitle = '', children }) {
    const { props } = usePage();
    const auth = props.auth;
    const notifications = props.notifications?.items || [];
    const unreadCount = props.notifications?.unreadCount || 0;

    const [showDropdown, setShowDropdown] = useState(false);

    const handleNotificationClick = (n) => {
        if (!n.read_at) {
            router.patch(route('notifications.read', n.id), {}, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'var(--bg2)', borderBottom: '1px solid var(--border2)' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Sora, sans-serif' }}>
                Winkü<span style={{ color: 'var(--green)' }}>.</span>
                {subtitle && (
                    <span style={{ color: 'var(--muted)', fontSize: '18px', fontWeight: '400' }}> {subtitle}</span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {children}

                {/* RF-20 CA-02: campana con badge */}
                {auth?.user && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', fontSize: '20px' }}
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-4px', right: '-6px',
                                    background: 'var(--pink)', color: '#fff', borderRadius: '50%',
                                    width: '18px', height: '18px', fontSize: '10px', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute', right: 0, top: '38px', width: '320px', maxHeight: '400px',
                                overflowY: 'auto', background: 'var(--card2)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            }}>
                                {notifications.length === 0 ? (
                                    <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
                                        Sin notificaciones.
                                    </p>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            style={{
                                                padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                                                background: n.read_at ? 'transparent' : 'rgba(52,211,153,0.06)',
                                            }}
                                        >
                                            <p style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                                                {n.data.message}
                                            </p>
                                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                                {new Date(n.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}