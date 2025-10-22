import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';



// *****************************************************************************
interface estaciones {
  id: number;
  estacion: string;
  estado: string;
  eta: number;
}
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}
let ruta_id:number = 1;



// *****************************************************************************
// conexion con supabase
import { supabase } from '../../lib/supabase';
const channel = supabase.channel(`ruta_${ruta_id}`);



// *****************************************************************************
export default function App() {
  const [estaciones, setEstaciones] = useState<estaciones[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // *****************************************************************************
    // mostrar datos al iniciar la app
    async function fetchData() {
      try {
        const { data: rows, error } = await supabase
          .from('temporal').select('*').eq('ruta',ruta_id)
          .order('id', { ascending: false }) as { data: estaciones[] | null, error: SupabaseError | null };
        
        if (error) console.error('Error:', error) 
        else  setEstaciones(rows || []);
      
      } catch (err) {
        console.error('Catch error:', err);
        setError(err instanceof Error ? err.message : 'error desconocido');
      }
    }
    fetchData();






// *****************************************************************************
    // crearcion de la conexión en tiempo real a supabase
    supabase.channel(`ruta_${ruta_id}`)
      .on('postgres_changes',
        // filtra los las filas de una ruta_id espacífica cuando ocurre un evento Update
        { event: 'UPDATE', schema: 'public', table: 'temporal', filter: `ruta=eq.${ruta_id}`},

        // Actualizar los datos que se muestran en el front 
        (payload) => {
          const ruta_actualizada = payload.new as estaciones;
          setEstaciones((prev) =>
            prev.map((row) => (row.id === ruta_actualizada.id ? ruta_actualizada : row))
          );
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status); 
      });

      return () => {
        console.log('Cleaning up subscription...');
        if (channel) supabase.removeChannel(channel);
      };
    }, []);








// *****************************************************************************
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Estaciones Ruta {ruta_id}</Text>
        {error && <Text style={styles.error}>Error: {error}</Text>}
        <ScrollView style={styles.scrollView}>
          {estaciones.length === 0 && !error ? (
            <Text style={styles.text}>No data yet...</Text>
          ) : (
            estaciones.map((row) => (
              <View key={row.id} style={styles.card}>
                <Text style={styles.cardText}>Estación: {row.estacion}</Text>
                <Text style={styles.cardText}>Estado: {row.estado}</Text>
                <Text style={styles.cardText}>Tiempo estimado: {row.eta} min</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}






// *****************************************************************************
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  card: {
    backgroundColor: '#eee',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
