import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Navbar from '@/Components/Navbar';

// RF-06: ícono representativo por categoría, para escanear la lista más rápido
const CATEGORY_ICON = {
    'Tecnología': '⚡',
    'Diseño':     '🎨',
    'Tutoría':    '📚',
    'Social':     '🤝',
    'Eventos':    '🎉',
    'Otros':      '📦',
};

export default function Dashboard({ auth, services = [], receivedRequests = [] }) {
    const [showForm, setShowForm]             = useState(false);
    const [editingService, setEditingService] = useState(null); // RF-08
    const [showReceivedRequests, setShowReceivedRequests] = useState(false); // RF-11: desplegable

    const user = usePage().props.auth?.user || auth?.user;
    const pendingCount = receivedRequests.filter(r => r.status === 'pending').length;

    // ── RF-05: useForm para crear servicio ────────────────────────────────────
    const { data, setData, post, processing, errors, reset } = useForm({
        title:       '',
        category:    'Tecnología',
        description: '',
        price:       '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    // ── RF-08: useForm para editar servicio ───────────────────────────────────
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        title:       '',
        category:    'Tecnología',
        description: '',
        price:       '',
    });

    // CA-01: Precargar datos actuales del servicio al abrir modal
    const handleEdit = (service) => {
        setEditingService(service);
        setEditData({
            title:       service.title,
            category:    service.category,
            description: service.description,
            price:       service.price,
        });
    };

     // RF-16: Marcar servicio como completado
    const handleComplete = (id) => {
        if (confirm('¿Marcar este servicio como completado? Esta acción cambia el estado definitivamente.')) {
            router.patch(route('services.complete', id), {}, { preserveScroll: true });
        }
    };

    // RF-12 CA-03: Pausar o activar el propio servicio
    const handleToggleStatus = (id) => {
        router.patch(route('services.toggle-status', id), {}, {
            preserveScroll: true,
        });
    };
    // RF-11 CA-02: Aceptar solicitud recibida
    const handleAcceptRequest = (id) => {
        if (confirm('¿Aceptar esta solicitud?')) {
            router.patch(route('service-requests.accept', id), {}, { preserveScroll: true });
        }
    };

    // RF-11 CA-02/CA-03: Rechazar solicitud recibida, con motivo opcional
    const handleRejectRequest = (id) => {
        const reason = prompt('Motivo del rechazo (opcional):') || '';
        router.patch(route('service-requests.reject', id), { rejection_reason: reason }, { preserveScroll: true });
    };

    const handleCancelEdit = () => {
        setEditingService(null);
        resetEdit();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('services.update', editingService.id), {
            onSuccess: () => {
                setEditingService(null);
                resetEdit();
            },
        });
    };

    // ── RF-07: Eliminar servicio ──────────────────────────────────────────────
    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta publicación? No podrás recuperarla.')) {
            router.delete(route('services.destroy', id));
        }
    };

    return (
        <>
            <Head title="Winkü | Mi Panel" />

            <div id="app">
                <div className="andean-strip"></div>

                {/* NAVBAR */}
                <Navbar subtitle="| Panel de Control">
                    <Link href={route('profile.edit')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        {user?.avatar ? (
                            <img
                                src={`/storage/${user.avatar}`}
                                alt="Mi Perfil"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                            />
                        ) : (
                            <div className="av v" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <span style={{ color: 'var(--text)', fontWeight: '600', cursor: 'pointer' }}>
                            {user?.name || 'Mi Perfil'} ✏️
                        </span>
                    </Link>
                </Navbar>

                {/* CONTENIDO */}
                <main style={{ padding: '50px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                    {/* SALUDO PERSONALIZADO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                        {user?.avatar ? (
                            <img
                                src={`/storage/${user.avatar}`}
                                alt={user.name}
                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                            />
                        ) : (
                            <div className="av v" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div>
                            <h2 className="t-display" style={{ fontSize: '28px', margin: 0 }}>
                                Hola, {user?.name?.split(' ')[0] || 'Winkü'}
                            </h2>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
                                Listo para conectar con la comunidad UNSCH hoy?
                            </p>
                        </div>
                    </div>

                    {/* ACCIONES RÁPIDAS — tarjetas con ícono en vez de botones planos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="p-card"
                            style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: 'none', background: 'rgba(52,211,153,0.08)' }}
                        >
                            <div style={{ fontSize: '26px', marginBottom: '8px' }}>{showForm ? '✕' : '➕'}</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--green, #34d399)' }}>
                                {showForm ? 'Cancelar' : 'Crear una publicación'}
                            </div>
                        </button>

                        <Link
                            href={route('service-requests.index')}
                            className="p-card"
                            style={{ padding: '20px', textAlign: 'center', textDecoration: 'none', background: 'rgba(129,140,248,0.08)' }}
                        >
                            <div style={{ fontSize: '26px', marginBottom: '8px' }}>📩</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--violet-lt, #818cf8)' }}>
                                Mis solicitudes enviadas
                            </div>
                        </Link>

                        <Link
                            href="/"
                            className="p-card"
                            style={{ padding: '20px', textAlign: 'center', textDecoration: 'none' }}
                        >
                            <div style={{ fontSize: '26px', marginBottom: '8px' }}>🏠</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                                Volver al inicio
                            </div>
                        </Link>
                    </div>

                    {/* RF-05: FORMULARIO CREAR */}
                    {showForm && (
                        <div className="p-card" style={{ padding: '40px', marginBottom: '40px', animation: 'fadeIn 0.3s ease' }}>
                            <h3 className="t-title" style={{ marginBottom: '25px', fontSize: '20px', color: 'var(--violet-lt)' }}>
                                Nuevo Servicio / Producto
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Título del servicio</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            maxLength={255}
                                            style={{ width: '100%', background: 'var(--bg)', border: errors.title ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                        {errors.title && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Categoría</label>
                                        <select
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg)', border: errors.category ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                        >
                                            <option value="Tecnología">⚡ Tecnología</option>
                                            <option value="Diseño">🎨 Diseño</option>
                                            <option value="Tutoría">📚 Tutoría</option>
                                            <option value="Social">🤝 Social</option>
                                            <option value="Eventos">🎉 Eventos</option>
                                            <option value="Otros">📦 Otros</option>
                                        </select>
                                        {errors.category && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{errors.category}</p>}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Descripción</label>
                                    <textarea
                                        rows="4"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        style={{ width: '100%', background: 'var(--bg)', border: errors.description ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                                    />
                                    {errors.description && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{errors.description}</p>}
                                </div>
                                <div style={{ width: '200px', marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Precio (S/.) — mín. 5.00</label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        min="5"
                                        step="0.50"
                                        placeholder="5.00"
                                        style={{ width: '100%', background: 'var(--bg)', border: errors.price ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                    />
                                    {errors.price && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{errors.price}</p>}
                                </div>
                                <button type="submit" disabled={processing} className="btn-sm g" style={{ padding: '12px 30px', fontSize: '16px' }}>
                                    {processing ? 'Guardando...' : 'Guardar Publicación'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* RF-11 CA-01: PANEL DE SOLICITUDES RECIBIDAS — desplegable, con badge de pendientes */}
                    <button
                        onClick={() => setShowReceivedRequests(!showReceivedRequests)}
                        className="btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '15px', background: 'var(--card2)', border: '1px solid var(--border)', marginBottom: showReceivedRequests ? '20px' : '40px' }}
                    >
                        <span>{showReceivedRequests ? '▲' : '▼'}</span>
                        <span>📥 Solicitudes recibidas</span>
                        {pendingCount > 0 && (
                            <span style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--amber, #fbbf24)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                {pendingCount} nueva{pendingCount > 1 ? 's' : ''}
                            </span>
                        )}
                        {pendingCount === 0 && (
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>({receivedRequests.length})</span>
                        )}
                    </button>

                    {showReceivedRequests && (
                    <div className="p-card" style={{ padding: '40px', marginBottom: '40px' }}>
                        {receivedRequests.length === 0 ? (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>Aún no has recibido solicitudes.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {receivedRequests.map(req => (
                                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                        <div>
                                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                                                {req.service?.title || 'Servicio eliminado'}
                                            </h4>
                                            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '6px' }}>
                                                Cliente: <strong>{req.client?.name || 'Usuario'}</strong>
                                            </p>
                                            {req.message && (
                                                <p style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic', marginBottom: '6px' }}>
                                                    "{req.message}"
                                                </p>
                                            )}
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                background: req.status === 'pending'  ? 'rgba(251,191,36,0.15)' :
                                                            req.status === 'accepted' ? 'rgba(52,211,153,0.15)' :
                                                            req.status === 'rejected' ? 'rgba(232,67,147,0.15)' : 'rgba(56,189,248,0.15)',
                                                color:      req.status === 'pending'  ? 'var(--amber, #fbbf24)' :
                                                            req.status === 'accepted' ? 'var(--green, #34d399)' :
                                                            req.status === 'rejected' ? 'var(--pink)'            : '#38bdf8',
                                            }}>
                                                {req.status === 'pending'  ? 'Pendiente' :
                                                 req.status === 'accepted' ? 'Aceptada'  :
                                                 req.status === 'rejected' ? 'Rechazada' : req.status}
                                            </span>
                                        </div>

                                        {req.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => handleAcceptRequest(req.id)}
                                                    className="btn-sm g"
                                                >
                                                    Aceptar
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="btn-sm"
                                                    style={{ background: 'rgba(232,67,147,0.1)', color: 'var(--pink)', border: '1px solid var(--pink)' }}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* RF-06: LISTA DE SERVICIOS — con ícono por categoría */}
                    <div className="p-card" style={{ padding: '40px' }}>
                        <h3 className="t-title" style={{ marginBottom: '25px', fontSize: '22px' }}>Mis Servicios Publicados</h3>

                        {services.length === 0 ? (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>Aún no tienes servicios publicados.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {services.map(service => (
                                    <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                                {CATEGORY_ICON[service.category] || '📦'}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{service.title}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <span className="pill g" style={{ padding: '2px 8px', fontSize: '11px' }}>{service.category}</span>
                                                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>S/. {Number(service.price).toFixed(2)}</span>
                                                    <span style={{
                                                        padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                        background: service.status === 'active'    ? 'rgba(52,211,153,0.15)' :
                                                                    service.status === 'completed' ? 'rgba(56,189,248,0.15)' :
                                                                    service.status === 'suspended' ? 'rgba(232,67,147,0.15)' : 'rgba(251,191,36,0.15)',
                                                        color:      service.status === 'active'    ? 'var(--green, #34d399)'  :
                                                                    service.status === 'completed' ? '#38bdf8'                :
                                                                    service.status === 'suspended' ? 'var(--pink)'            : 'var(--amber, #fbbf24)',
                                                    }}>
                                                        {service.status === 'active'    ? 'Activo'     :
                                                        service.status === 'completed' ? 'Completado' :
                                                        service.status === 'suspended' ? '🔒 Suspendido' : 'Inactivo'}
                                                    </span>
                                                    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                                                        {new Date(service.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* RF-07 + RF-08: Botones Editar y Eliminar */}
                                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                            <button
                                                onClick={() => service.status !== 'suspended' && handleToggleStatus(service.id)}
                                                className="btn-sm"
                                                style={{
                                                    background: service.status === 'suspended' ? 'rgba(232,67,147,0.1)' :
                                                                service.status === 'active'    ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                                                    color:      service.status === 'suspended' ? 'var(--pink)'          :
                                                                service.status === 'active'    ? 'var(--amber, #fbbf24)': 'var(--green, #34d399)',
                                                    border:     service.status === 'suspended' ? '1px solid var(--pink)':
                                                                service.status === 'active'    ? '1px solid var(--amber, #fbbf24)' : '1px solid var(--green, #34d399)',
                                                    cursor:     service.status === 'suspended' ? 'not-allowed' : 'pointer',
                                                    opacity:    service.status === 'suspended' ? 0.6 : 1,
                                                }}
                                                title={service.status === 'suspended' ? 'Suspendido por el administrador' : ''}
                                            >
                                                {service.status === 'active'    ? 'Pausar'      :
                                                service.status === 'suspended' ? '🔒 Suspendido' : 'Activar'}
                                            </button>

                                        {(service.status === 'active' || service.status === 'inactive') && (
                                            <button
                                                onClick={() => handleComplete(service.id)}
                                                className="btn-sm"
                                                style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid #38bdf8' }}
                                            >
                                                ✓ Completar
                                            </button>
                                        )}        
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="btn-sm"
                                                style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--violet-lt, #818cf8)', border: '1px solid var(--violet-lt, #818cf8)' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="btn-sm"
                                                style={{ background: 'rgba(232, 67, 147, 0.1)', color: 'var(--pink)', border: '1px solid var(--pink)' }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RF-08: MODAL EDITAR */}
                    {editingService && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                            <div className="p-card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                                <h3 className="t-title" style={{ marginBottom: '25px', fontSize: '20px', color: 'var(--violet-lt)' }}>
                                    Editar Servicio
                                </h3>
                                <form onSubmit={handleUpdate}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Título del servicio</label>
                                            <input
                                                type="text"
                                                value={editData.title}
                                                onChange={e => setEditData('title', e.target.value)}
                                                maxLength={255}
                                                style={{ width: '100%', background: 'var(--bg)', border: editErrors.title ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none', boxSizing: 'border-box' }}
                                            />
                                            {editErrors.title && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{editErrors.title}</p>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Categoría</label>
                                            <select
                                                value={editData.category}
                                                onChange={e => setEditData('category', e.target.value)}
                                                style={{ width: '100%', background: 'var(--bg)', border: editErrors.category ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                            >
                                                <option value="Tecnología">⚡ Tecnología</option>
                                                <option value="Diseño">🎨 Diseño</option>
                                                <option value="Tutoría">📚 Tutoría</option>
                                                <option value="Social">🤝 Social</option>
                                                <option value="Eventos">🎉 Eventos</option>
                                                <option value="Otros">📦 Otros</option>
                                            </select>
                                            {editErrors.category && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{editErrors.category}</p>}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Descripción</label>
                                        <textarea
                                            rows="4"
                                            value={editData.description}
                                            onChange={e => setEditData('description', e.target.value)}
                                            style={{ width: '100%', background: 'var(--bg)', border: editErrors.description ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                                        />
                                        {editErrors.description && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{editErrors.description}</p>}
                                    </div>
                                    <div style={{ width: '200px', marginBottom: '30px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Precio (S/.) — mín. 5.00</label>
                                        <input
                                            type="number"
                                            value={editData.price}
                                            onChange={e => setEditData('price', e.target.value)}
                                            min="5"
                                            step="0.50"
                                            style={{ width: '100%', background: 'var(--bg)', border: editErrors.price ? '1px solid var(--pink)' : '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                        />
                                        {editErrors.price && <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>{editErrors.price}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" disabled={editProcessing} className="btn-sm g" style={{ padding: '12px 30px', fontSize: '16px' }}>
                                            {editProcessing ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                        <button type="button" onClick={handleCancelEdit} className="btn-sm" style={{ padding: '12px 24px', fontSize: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}