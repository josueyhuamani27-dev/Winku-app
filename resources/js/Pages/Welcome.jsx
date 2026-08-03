import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Navbar from '@/Components/Navbar';



// ═══════════════════════════════════════════════════════════════════
// RF-10: Solicitud de servicio por el cliente
// Componente de nivel superior (fuera de Welcome) por la misma razón
// que RatingForm: conservar su estado (open, sent, error) entre
// re-renders de Welcome.
// ═══════════════════════════════════════════════════════════════════
function RequestServiceButton({ serviceId }) {
    const [open, setOpen]       = useState(false);
    const [message, setMessage] = useState('');
    const [sent, setSent]       = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('service-requests.store'), {
            service_id: serviceId,
            message,
        }, {
            preserveScroll: true,
            onSuccess: () => setSent(true),
            onError: (errors) => setError(errors.service_request || 'No se pudo enviar la solicitud.'),
        });
    };

    if (sent) {
        return (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', color: 'var(--green)', textAlign: 'center', fontSize: '13px' }}>
                ✓ Solicitud enviada. Espera la respuesta del proveedor.
            </div>
        );
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="btn-sm g"
                style={{ marginTop: '12px', width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600' }}
            >
                📩 Solicitar Servicio
            </button>
        );
    }

    return (
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--card2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    placeholder="Mensaje opcional para el proveedor..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', resize: 'none', boxSizing: 'border-box', outline: 'none' }}
                />
                {error && (
                    <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '6px' }}>{error}</p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="submit" className="btn-sm g" style={{ flex: 1, padding: '8px', fontSize: '13px' }}>
                        Enviar solicitud
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className="btn-sm" style={{ padding: '8px 12px', fontSize: '13px' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// RF-19 CA-01: Botón + mini-formulario para reportar una reseña
// ═══════════════════════════════════════════════════════════════════
function ReportRatingButton({ ratingId }) {
    const [open, setOpen]     = useState(false);
    const [reason, setReason] = useState('Spam');
    const [details, setDetails] = useState('');
    const [sent, setSent]     = useState(false);

    const REASONS = ['Spam', 'Contenido ofensivo', 'Información falsa', 'Otro'];

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('ratings.report', ratingId), { reason, details }, {
            preserveScroll: true,
            onSuccess: () => setSent(true),
        });
    };

    if (sent) {
        return <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Reporte enviado</span>;
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
            >
                Reportar
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '8px', padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: '#fff', padding: '6px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginBottom: '6px' }}
            >
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {reason === 'Otro' && (
                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={255}
                    placeholder="Describe el motivo..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: '#fff', padding: '6px', borderRadius: 'var(--radius-sm)', fontSize: '12px', resize: 'none', boxSizing: 'border-box', marginBottom: '6px' }}
                />
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn-sm g" style={{ fontSize: '11px', padding: '4px 10px' }}>Enviar</button>
                <button type="button" onClick={() => setOpen(false)} className="btn-sm" style={{ fontSize: '11px', padding: '4px 10px' }}>Cancelar</button>
            </div>
        </form>
    );
}

export default function Welcome({ auth, services = [], filters = {} }) {
    //                                           ↑ Valores por defecto seguros
    //                                           Si el servidor no envía 'filters',
    //                                           React no explota con "Cannot read
    //                                           properties of undefined (reading 'search')"

    const [currentScreen, setCurrentScreen] = useState('splash');
    const [reviewsModalService, setReviewsModalService] = useState(null); // RF-17/RF-18: servicio cuyo modal de reseñas está abierto

    // Lectura segura de filtros con fallback a string vacío
    const [search, setSearch]               = useState(filters?.search   ?? '');
    const [activeCategory, setActiveCategory] = useState(filters?.category ?? '');

    const categories = ['Tecnología', 'Diseño', 'Tutoría', 'Social', 'Eventos', 'Otros'];

    // ── Splash de 2 segundos ──────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => setCurrentScreen('home'), 2000);
        return () => clearTimeout(timer);
    }, []);

    // ── Búsqueda con debounce (500ms) ─────────────────────────────────────────
    useEffect(() => {
        if (currentScreen === 'splash') return;

        const debounce = setTimeout(() => {
            const searchChanged   = search        !== (filters?.search   ?? '');
            const categoryChanged = activeCategory !== (filters?.category ?? '');

            if (searchChanged || categoryChanged) {
                router.get(
                    '/',
                    { search, category: activeCategory },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['services', 'filters'], // Partial reload: solo pide los datos necesarios
                    }
                );
            }
        }, 500);

        return () => clearTimeout(debounce);
    }, [search, activeCategory, currentScreen]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleClearFilters = () => {
        setSearch('');
        setActiveCategory('');
        router.get('/', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Winkü | Inicio" />

            <div id="app">
                <div className="andean-strip"></div>

                {/* ── SPLASH ─────────────────────────────────────────────── */}
                {currentScreen === 'splash' && (
                    <div
                        id="screen-splash"
                        className="screen active"
                        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div className="splash-logo">
                            <div className="splash-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h1 className="splash-name">Winkü<span>.</span></h1>
                            <p className="splash-tagline">Comercio Electrónico Local</p>
                        </div>
                    </div>
                )}

                {/* ── HOME ───────────────────────────────────────────────── */}
                {currentScreen === 'home' && (
                    <div id="screen-home" className="screen active">

                        {/* NAVBAR */}
                        <Navbar>
                            {/* BUSCADOR */}
                            <div className="search-bar" style={{ width: '400px', position: 'relative', zIndex: 50 }}>
                                <input
                                    id="wink-search"
                                    type="text"
                                    autoComplete="off"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por título o descripción..."
                                    style={{
                                        width: '100%',
                                        padding: '10px 40px 10px 15px',
                                        background: 'var(--bg)',
                                        border: '1px solid var(--border)',
                                        color: '#fff',
                                        borderRadius: 'var(--radius-sm)',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        pointerEvents: 'auto',
                                    }}
                                />
                                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
                                    🔍
                                </span>
                            </div>

                            {/* AUTH CONDICIONAL — con protección anti-crash en auth?.user */}
                            <div>
                                {auth?.user ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span>Hola, <strong>{auth.user.name}</strong></span>
                                        <Link href={route('dashboard')} className="btn-sm">Mi Panel</Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link href={route('login')} className="btn-sm">Ingresar</Link>
                                        <Link href={route('register')} className="btn-sm g">Registrarse</Link>
                                    </div>
                                )}
                            </div>
                        </Navbar>

                        {/* CONTENIDO */}
                        <main style={{ padding: '50px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                            {/* BANNER */}
                            <div style={{ background: 'linear-gradient(135deg, var(--violet-dk), var(--card2))', padding: '60px', borderRadius: 'var(--radius)', marginBottom: '40px' }}>
                                <h2 className="t-display" style={{ fontSize: '40px', marginBottom: '15px' }}>
                                    El talento de Ayacucho, <br /> a un clic de distancia.
                                </h2>
                                <p className="t-body" style={{ fontSize: '18px', color: 'var(--violet-lt)' }}>
                                    La plataforma universitaria para conectar profesionales y clientes.
                                </p>
                            </div>

                            {/* FILTROS POR CATEGORÍA */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
                                <button
                                    onClick={() => setActiveCategory('')}
                                    className={`btn-sm ${activeCategory === '' ? 'g' : ''}`}
                                    style={{ background: activeCategory === '' ? '' : 'var(--card2)', border: activeCategory === '' ? '' : '1px solid var(--border)', whiteSpace: 'nowrap' }}
                                >
                                    🌐 Todos los servicios
                                </button>

                                {categories.map((cat) => {
                                    const isActive = activeCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(isActive ? '' : cat)}
                                            className={`btn-sm ${isActive ? 'g' : ''}`}
                                            style={{ background: isActive ? '' : 'var(--card2)', border: isActive ? '' : '1px solid var(--border)', whiteSpace: 'nowrap' }}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* TÍTULO Y LIMPIAR FILTROS */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 className="t-title" style={{ fontSize: '24px' }}>
                                    {search || activeCategory ? 'Resultados de búsqueda' : 'Expertos y Servicios Disponibles'}
                                </h3>
                                {(search || activeCategory) && (
                                    <button
                                        onClick={handleClearFilters}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--pink)', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        ✕ Limpiar filtros
                                    </button>
                                )}
                            </div>

                            {/* GRID DE SERVICIOS */}
                            {services.length === 0 ? (
                                <div className="p-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
                                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                                        ⚠️ No se encontraron servicios que coincidan con tu búsqueda.
                                    </p>
                                    <p style={{ fontSize: '14px' }}>
                                        Intenta cambiando las palabras clave o seleccionando otra categoría.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                    {services.map((service) => (
                                        <div key={service.id} className="p-card">
                                            <div className="p-card-top">
                                                {/* Avatar: imagen real si existe, inicial si no */}
                                                {service.user?.avatar ? (
                                                    <img
                                                        src={`/storage/${service.user.avatar}`}
                                                        alt={service.user.name}
                                                        className="av"
                                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            // Fallback a iniciales si la imagen falla
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="av v"
                                                    style={{ display: service.user?.avatar ? 'none' : 'flex' }}
                                                >
                                                    {getInitials(service.user?.name)}
                                                </div>
                                                <div className="online-dot"></div>
                                            </div>

                                            <h4
                                                className="p-card-name"
                                                style={{ minHeight: '56px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                            >
                                                {service.title}
                                            </h4>

                                            <p className="p-card-career" style={{ fontSize: '13px', marginBottom: '8px' }}>
                                                Por: <Link href={route('profile.show', service.user_id)} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    <strong style={{ textDecoration: 'underline' }}>{service.user?.name || 'Usuario Winkü'}</strong>
                                                </Link>
                                                {' '}
                                                {/* RF-18 CA-02: "Nuevo" si el proveedor tiene menos de 3 valoraciones en total */}
                                                {service.provider_ratings_count < 3 ? (
                                                    <span className="pill" style={{ fontSize: '10px', padding: '1px 8px', background: 'rgba(148,163,184,0.15)', color: 'var(--muted)' }}>
                                                        Nuevo
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--amber, #fbbf24)', fontSize: '12px' }}>
                                                        ⭐ {Number(service.provider_ratings_avg).toFixed(1)}
                                                    </span>
                                                )}
                                            </p>

                                            <div className="p-card-tags" style={{ marginBottom: '12px' }}>
                                                <span className="pill g">{service.category}</span>
                                            </div>

                                            <p style={{ fontSize: '14px', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px', height: '63px' }}>
                                                {service.description}
                                            </p>

                                            <div className="p-card-footer">
                                            <div
                                                className="stars"
                                                onClick={() => setReviewsModalService(service)}
                                                style={{ cursor: 'pointer' }}
                                                title="Ver comentarios"
                                            >
                                                {service.ratings_count > 0 ? (
                                                    <>
                                                        {'★'.repeat(Math.round(service.ratings_avg_rating))}
                                                        {'☆'.repeat(5 - Math.round(service.ratings_avg_rating))}
                                                        <small style={{ color: 'var(--muted)', marginLeft: '6px' }}>
                                                            ({service.ratings_count})
                                                        </small>
                                                    </>
                                                ) : (
                                                    <small style={{ color: 'var(--muted)' }}>Nuevo</small>
                                                )}
                                            </div>
                                            <div className="p-card-rate">
                                                S/. {Number(service.price).toFixed(2)} <small>/total</small>
                                            </div>
                                        </div>

                                            {/* CA-02, CA-03, CA-04: Botón WhatsApp dinámico */}
                                            {service.user?.phone && (
                                                <a
                                                    href={`https://wa.me/51${service.user.phone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'block',
                                                        marginTop: '12px',
                                                        padding: '10px',
                                                        background: 'rgba(37,211,102,0.12)',
                                                        border: '1px solid #25d366',
                                                        borderRadius: 'var(--radius-sm)',
                                                        color: '#25d366',
                                                        textAlign: 'center',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    💬 Contactar por WhatsApp
                                                </a>
                                            )}

                                        {/* RF-10: Solicitar servicio — solo si logueado, no es el dueño, y el servicio está activo */}
                                        {auth?.user && auth.user.id !== service.user_id && service.status === 'active' && (
                                            <RequestServiceButton serviceId={service.id} />
                                        )}

                                        </div>
                                    ))}
                                    ))
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {/* RF-17 CA-06 / RF-18: Modal de comentarios y valoración promedio */}
            {reviewsModalService && (
                <div
                    onClick={() => setReviewsModalService(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
                >
                    <div
                        className="p-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '550px', maxHeight: '80vh', overflowY: 'auto', padding: '40px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 className="t-title" style={{ fontSize: '20px', marginBottom: '6px' }}>
                                    {reviewsModalService.title}
                                </h3>
                                <div style={{ fontSize: '16px' }}>
                                    {reviewsModalService.ratings_count > 0 ? (
                                        <>
                                            {'★'.repeat(Math.round(reviewsModalService.ratings_avg_rating))}
                                            {'☆'.repeat(5 - Math.round(reviewsModalService.ratings_avg_rating))}
                                            <span style={{ color: 'var(--muted)', fontSize: '13px', marginLeft: '8px' }}>
                                                {Number(reviewsModalService.ratings_avg_rating).toFixed(1)} · {reviewsModalService.ratings_count} valoración(es)
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Sin valoraciones todavía</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setReviewsModalService(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        {reviewsModalService.ratings?.length === 0 ? (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                                Aún nadie ha comentado este servicio.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {reviewsModalService.ratings?.map((r) => (
                                    <div key={r.id} style={{ padding: '15px', background: 'var(--card2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <strong style={{ fontSize: '14px' }}>{r.client?.name || 'Usuario Winkü'}</strong>
                                            <span style={{ fontSize: '14px' }}>
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </span>
                                        </div>
                                        {r.comment && (
                                            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>{r.comment}</p>
                                        )}
                                        {auth?.user && (
                                            <ReportRatingButton ratingId={r.id} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}