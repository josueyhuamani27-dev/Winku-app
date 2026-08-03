import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const S = {
    page:       { minHeight: '100vh', background: '#0a0b0d', color: '#fff', fontFamily: 'sans-serif' },
    nav:        { background: '#111318', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f232b' },
    content:    { padding: '40px max(20px, 5%)' },
    card:       { background: '#111318', border: '1px solid #1f232b', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' },
    metricCard: { background: '#111318', border: '1px solid #1f232b', borderRadius: '10px', padding: '20px', textAlign: 'center' },
    table:      { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th:         { textAlign: 'left', padding: '10px 12px', color: '#70778b', borderBottom: '1px solid #1f232b', fontSize: '12px', textTransform: 'uppercase' },
    td:         { padding: '12px', borderBottom: '1px solid #1a1e27' },
    btnGreen:   { background: '#00e676', color: '#000', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    btnRed:     { background: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    btnGray:    { background: '#1f232b', color: '#aaa', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' },
    btnAmber:   { background: '#fbbf2422', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    badge: (status) => ({
        display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: '700',
        background: status === 'active'    ? '#00e67622' :
                    status === 'suspended' ? '#e5393522' : '#fbbf2422',
        color:      status === 'active'    ? '#00e676'   :
                    status === 'suspended' ? '#e53935'   : '#fbbf24',
    }),
};

export default function AdminDashboard({ metrics, users, services = [], logs, reportedRatings = [] }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const [activeTab, setActiveTab] = useState('users');

    // Usuarios
    const handleToggleUserStatus = (user) => {
        const action = user.status === 'active' ? 'suspender' : 'activar';
        if (!confirm(`¿Seguro que deseas ${action} a "${user.name}"?`)) return;
        router.patch(route('admin.users.toggle-status', user.id), {}, { preserveScroll: true });
    };

    const handleDeleteUser = (user) => {
        if (!confirm(`¿Eliminar permanentemente a "${user.name}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('admin.users.delete', user.id), { preserveScroll: true });
    };

    // RF-12 CA-02: Servicios
    const handleToggleServiceStatus = (service) => {
        const action = service.status === 'active' ? 'pausar' : 'activar';
        if (!confirm(`¿Seguro que deseas ${action} el servicio "${service.title}"?`)) return;
        router.patch(route('admin.services.toggle-status', service.id), {}, { preserveScroll: true });
    };

    // RF-19 CA-03: decisión del admin sobre reseñas reportadas
    const handleRestoreRating = (rating) => {
        if (!confirm('¿Restaurar esta reseña? Volverá a ser visible públicamente.')) return;
        router.patch(route('admin.ratings.restore', rating.id), {}, { preserveScroll: true });
    };

    const handleDeleteRating = (rating) => {
        if (!confirm('¿Eliminar esta reseña permanentemente?')) return;
        router.delete(route('admin.ratings.delete', rating.id), { preserveScroll: true });
    };

    const tabs = [
        { key: 'users',    label: `👥 Usuarios (${users.length})` },
        { key: 'services', label: `🛠️ Servicios (${services.length})` },
        { key: 'reports',  label: `🚩 Reportes (${reportedRatings.length})` },
        { key: 'logs',     label: `📋 Log de acciones (${logs.length})` },
    ];

    return (
        <>
            <Head title="Panel de Administración — Winkü" />
            <div style={S.page}>

                {/* NAVBAR */}
                <nav style={S.nav}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--green, #00e676)' }}>Winkü.</span>
                        <span style={{ fontSize: '12px', background: '#e53935', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>
                    </div>
                    <Link href={route('dashboard')} style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>
                        ← Volver al espacio estudiante
                    </Link>
                </nav>

                <div style={S.content}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' }}>Panel de Control Global</h1>
                    <p style={{ color: '#70778b', marginBottom: '28px' }}>Gestión, auditoría y métricas de la plataforma Winkü.</p>

                    {/* Flash messages */}
                    {flash.success && (
                        <div style={{ background: '#00e67622', border: '1px solid #00e676', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#00e676' }}>
                            ✓ {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div style={{ background: '#e5393522', border: '1px solid #e53935', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#e53935' }}>
                            ✗ {flash.error}
                        </div>
                    )}

                    {/* CA-03: MÉTRICAS */}
                    <div style={S.metricGrid}>
                        {[
                            { label: 'Usuarios totales',     value: metrics.total_users,     color: '#7c3aed' },
                            { label: 'Usuarios activos',     value: metrics.active_users,    color: '#00e676' },
                            { label: 'Usuarios suspendidos', value: metrics.inactive_users,  color: '#e53935' },
                            { label: 'Servicios totales',    value: metrics.total_services,  color: '#fbbf24' },
                            { label: 'Servicios activos',    value: metrics.active_services, color: '#38bdf8' },
                        ].map((m) => (
                            <div key={m.label} style={S.metricCard}>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: m.color }}>{m.value}</div>
                                <div style={{ fontSize: '12px', color: '#70778b', marginTop: '4px' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* TABS */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    background: activeTab === tab.key ? '#00e676' : '#1f232b',
                                    color:      activeTab === tab.key ? '#000'     : '#aaa',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB: USUARIOS */}
                    {activeTab === 'users' && (
                        <div style={S.card}>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Gestión de usuarios</h2>
                            {users.length === 0 ? (
                                <p style={{ color: '#70778b', textAlign: 'center', padding: '40px' }}>No hay usuarios registrados aún.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th}>ID</th>
                                                <th style={S.th}>Nombre</th>
                                                <th style={S.th}>Correo</th>
                                                <th style={S.th}>Carrera</th>
                                                <th style={S.th}>Estado</th>
                                                <th style={S.th}>Registro</th>
                                                <th style={S.th}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td style={{ ...S.td, color: '#70778b' }}>#{user.id}</td>
                                                    <td style={S.td}>{user.name}</td>
                                                    <td style={{ ...S.td, color: '#70778b' }}>{user.email}</td>
                                                    <td style={{ ...S.td, color: '#70778b' }}>{user.career || '—'}</td>
                                                    <td style={S.td}><span style={S.badge(user.status)}>{user.status === 'active' ? 'Activo' : 'Suspendido'}</span></td>
                                                    <td style={{ ...S.td, color: '#70778b', fontSize: '12px' }}>{new Date(user.created_at).toLocaleDateString('es-PE')}</td>
                                                    <td style={S.td}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button style={user.status === 'active' ? S.btnGray : S.btnGreen} onClick={() => handleToggleUserStatus(user)}>
                                                                {user.status === 'active' ? 'Suspender' : 'Activar'}
                                                            </button>
                                                            <button style={S.btnRed} onClick={() => handleDeleteUser(user)}>Eliminar</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SERVICIOS — RF-12 CA-02 */}
                    {activeTab === 'services' && (
                        <div style={S.card}>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Gestión de servicios</h2>
                            {services.length === 0 ? (
                                <p style={{ color: '#70778b', textAlign: 'center', padding: '40px' }}>No hay servicios publicados aún.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th}>ID</th>
                                                <th style={S.th}>Título</th>
                                                <th style={S.th}>Proveedor</th>
                                                <th style={S.th}>Categoría</th>
                                                <th style={S.th}>Precio</th>
                                                <th style={S.th}>Estado</th>
                                                <th style={S.th}>Fecha</th>
                                                <th style={S.th}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {services.map((service) => (
                                                <tr key={service.id}>
                                                    <td style={{ ...S.td, color: '#70778b' }}>#{service.id}</td>
                                                    <td style={S.td}>{service.title}</td>
                                                    <td style={{ ...S.td, color: '#70778b' }}>{service.user?.name || '—'}</td>
                                                    <td style={S.td}>
                                                        <span style={{ background: '#7c3aed22', color: '#a78bfa', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                                            {service.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...S.td, color: '#fbbf24' }}>S/. {Number(service.price).toFixed(2)}</td>
                                                    <td style={S.td}><span style={S.badge(service.status)}>{service.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                                                    <td style={{ ...S.td, color: '#70778b', fontSize: '12px' }}>{new Date(service.created_at).toLocaleDateString('es-PE')}</td>
                                                    <td style={S.td}>
                                                        <button
                                                        style={service.status === 'active' ? S.btnAmber :
                                                            service.status === 'suspended' ? S.btnGreen : S.btnGreen}
                                                        onClick={() => handleToggleServiceStatus(service)}
                                                    >
                                                        {service.status === 'active'    ? 'Suspender' :
                                                        service.status === 'suspended' ? 'Reactivar' : 'Reactivar'}
                                                    </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: REPORTES — RF-19 */}
                    {activeTab === 'reports' && (
                        <div style={S.card}>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Reseñas reportadas (3+ reportes)</h2>
                            {reportedRatings.length === 0 ? (
                                <p style={{ color: '#70778b', textAlign: 'center', padding: '40px' }}>No hay reseñas pendientes de revisión.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {reportedRatings.map((rating) => (
                                        <div key={rating.id} style={{ padding: '20px', background: '#0a0b0d', border: '1px solid #1f232b', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <div>
                                                    <strong style={{ fontSize: '14px' }}>{rating.client?.name || 'Usuario'}</strong>
                                                    <span style={{ color: '#70778b', fontSize: '13px' }}> en "{rating.service?.title || 'Servicio eliminado'}"</span>
                                                </div>
                                                <span style={{ fontSize: '14px' }}>{'★'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}</span>
                                            </div>
                                            {rating.comment && (
                                                <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '12px' }}>"{rating.comment}"</p>
                                            )}
                                            <div style={{ marginBottom: '12px' }}>
                                                <p style={{ fontSize: '12px', color: '#70778b', marginBottom: '6px' }}>Reportes recibidos:</p>
                                                {rating.reports?.map((r) => (
                                                    <div key={r.id} style={{ fontSize: '12px', color: '#aaa', marginBottom: '3px' }}>
                                                        • <strong>{r.reporter?.name}</strong> — {r.reason}{r.details ? `: ${r.details}` : ''}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button style={S.btnGreen} onClick={() => handleRestoreRating(rating)}>Restaurar reseña</button>
                                                <button style={S.btnRed} onClick={() => handleDeleteRating(rating)}>Eliminar reseña</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: LOG DE ACCIONES */}
                    {activeTab === 'logs' && (
                        <div style={S.card}>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Log de acciones administrativas</h2>
                            {logs.length === 0 ? (
                                <p style={{ color: '#70778b', textAlign: 'center', padding: '40px' }}>No hay acciones registradas aún.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th}>Fecha</th>
                                                <th style={S.th}>Admin</th>
                                                <th style={S.th}>Acción</th>
                                                <th style={S.th}>Descripción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log.id}>
                                                    <td style={{ ...S.td, color: '#70778b', fontSize: '12px' }}>{new Date(log.created_at).toLocaleString('es-PE')}</td>
                                                    <td style={S.td}>{log.admin?.name || '—'}</td>
                                                    <td style={S.td}>
                                                        <code style={{ background: '#1f232b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#fbbf24' }}>
                                                            {log.action}
                                                        </code>
                                                    </td>
                                                    <td style={{ ...S.td, color: '#aaa' }}>{log.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}