import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const UserMetrics = ({ cardId }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('user_metrics')
          .select('*')
          .eq('card_id', cardId)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        setMetrics(data || []);
      } catch (err) {
        console.error('Error fetching user metrics:', err);
        setError('Error al cargar las métricas del usuario');
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchUserMetrics();
    }
  }, [cardId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No se encontraron métricas para este usuario
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Estadísticas de Uso</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-700">Total de Accesos</h4>
          <p className="text-2xl font-bold">{metrics.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium text-gray-700">Último Acceso</h4>
          <p className="text-lg">
            {new Date(metrics[0].created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-medium text-gray-700 mb-2">Historial Reciente</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {metrics.map((metric) => (
            <div key={metric.id} className="border-b pb-2 last:border-0">
              <div className="flex justify-between">
                <span className="font-medium">
                  {new Date(metric.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(metric.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">Tipo: {metric.access_type || 'General'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserMetrics;