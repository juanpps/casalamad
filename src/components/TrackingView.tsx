import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import '../index.css';

interface TrackingViewProps {
  token: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ token }) => {
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedido = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('tracking_token', token)
          .single();

        if (error || !data) {
          setError('Pedido finalizado o no encontrado');
        } else {
          setPedido(data);
        }
      } catch (err) {
        setError('Pedido finalizado o no encontrado');
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [token]);

  useEffect(() => {
    if (!pedido || !pedido.id) return;

    // Realtime subscription
    const channel = supabase
      .channel(`tracking-${pedido.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedido.id}` },
        (payload) => {
          setPedido(payload.new);
          if (payload.new.tracking_activo === false || ['entregado', 'cancelado'].includes(payload.new.estado)) {
            // maybe handle expiration here, but PRD says RLS handles it after 2 hours
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedido?.id]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#C9A227' }}>Cargando seguimiento...</div>;
  }

  if (error || !pedido) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center', background: 'rgba(20,20,20,0.8)', borderRadius: '12px', border: '1px solid rgba(201, 162, 39, 0.3)' }}>
        <h2 style={{ color: '#C9A227', marginBottom: '15px' }}>✅ Pedido finalizado</h2>
        <p style={{ color: 'rgba(250,243,224,0.7)', marginBottom: '20px' }}>Este seguimiento ya no está disponible.</p>
        <p style={{ color: 'rgba(250,243,224,0.7)', marginBottom: '10px' }}>¿Quieres hacer otro pedido?</p>
        <button onClick={() => window.location.href = '/'} style={{ background: '#C9A227', color: '#111', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          Ver menú
        </button>
      </div>
    );
  }

  // Determine progress
  const isDomicilio = pedido.tipo_entrega === 'domicilio';
  
  const estadosDomicilio = ['confirmado', 'en_preparacion', 'en_camino', 'entregado'];
  const estadosRecogida = ['confirmado', 'en_preparacion', 'listo_recoger', 'entregado'];
  const steps = isDomicilio ? estadosDomicilio : estadosRecogida;
  const labels = isDomicilio 
    ? ['Confirmado', 'Preparación', 'En camino', 'Entregado']
    : ['Confirmado', 'Preparación', 'Listo', 'Entregado'];

  const currentIdx = steps.indexOf(pedido.estado);

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', color: '#FAF3E0' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#C9A227', margin: '0 0 5px' }}>🥢 Casa LAMAD</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Seguimiento de pedido #{pedido.numero}</p>
      </div>

      <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(201, 162, 39, 0.2)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px', color: '#C9A227' }}>Hola, {pedido.cliente_nombre} 👋</h3>
        <p style={{ margin: '0 0 20px', opacity: 0.9 }}>
          {pedido.estado === 'confirmado' && 'Tu pedido ha sido recibido y confirmado.'}
          {pedido.estado === 'en_preparacion' && 'Estamos preparando tu comida.'}
          {pedido.estado === 'en_camino' && 'Tu pedido va en camino a la dirección indicada.'}
          {pedido.estado === 'listo_recoger' && 'Tu pedido está listo para ser recogido.'}
          {pedido.estado === 'entregado' && 'Tu pedido ha sido entregado. ¡Disfrútalo!'}
          {pedido.estado === 'cancelado' && 'Tu pedido ha sido cancelado.'}
        </p>

        {pedido.estado !== 'cancelado' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', background: 'rgba(250,243,224,0.2)', zIndex: 0 }}></div>
            {steps.map((step, idx) => {
              const isCompleted = currentIdx >= idx;
              const isCurrent = currentIdx === idx;
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: '25%' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', 
                    background: isCompleted ? '#C9A227' : '#333',
                    border: '2px solid #111',
                    boxShadow: isCurrent ? '0 0 10px #C9A227' : 'none',
                    marginBottom: '8px'
                  }}></div>
                  <span style={{ fontSize: '11px', opacity: isCompleted ? 1 : 0.5, color: isCompleted ? '#C9A227' : '#FAF3E0', textAlign: 'center' }}>
                    {labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px', opacity: 0.7, fontSize: '13px', textTransform: 'uppercase' }}>Tu pedido:</h4>
          {pedido.items?.map((item: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>• {item.cantidad}x {item.nombre}</span>
              <span style={{ opacity: 0.8 }}>${item.subtotal?.toLocaleString('es-CO')}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed rgba(250,243,224,0.2)', margin: '10px 0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#C9A227' }}>
            <span>Total:</span>
            <span>${pedido.total?.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {isDomicilio && pedido.direccion && (
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px', opacity: 0.7, fontSize: '12px', textTransform: 'uppercase' }}>📍 Entrega en:</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{pedido.direccion}</p>
          </div>
        )}

        <div>
          <h4 style={{ margin: '0 0 5px', opacity: 0.7, fontSize: '12px', textTransform: 'uppercase' }}>⏱ Pedido realizado:</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {new Date(pedido.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', color: '#C9A227', border: '1px solid #C9A227', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Volver al menú
        </button>
      </div>
    </div>
  );
};
