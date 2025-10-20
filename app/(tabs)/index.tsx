import { createClient } from '@supabase/supabase-js';
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


// *****************************************************************************
// F*** enviroment variables (this is just a test)
const supabaseUrl = 'https://xxxxxxxxx.supabase.co';
const supabaseAnonKey = 'xxxxxxxxxx';
const supabase = createClient(supabaseUrl, supabaseAnonKey);



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
          .from('temporal')
          .select('*')
          .eq('ruta',1)
          .order('id', { ascending: false }) as { data: estaciones[] | null, error: SupabaseError | null };
        if (error) {
          console.error('Error:', error);
          setError(error.message);
        } else {
          // console.log('Data:', rows);
          setEstaciones(rows || []);
        }
      } catch (err) {
        console.error('Catch error:', err);
        setError(err instanceof Error ? err.message : 'error desconocido');
      }
    }
    fetchData();








// *****************************************************************************
    // crearcion de la conexión en tiempo real a supabase
    const channel = supabase
      .channel('realtime-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'temporal', filter: 'ruta=eq.1'},
        (payload: { new: estaciones }) => {
          // console.log('Change received!', payload);
          // setEstaciones([payload.new]);
          fetchData()
        }
      )
      .subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) console.error('Subscription error:', err);
      });

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);








// *****************************************************************************
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Estaciones Ruta 1</Text>
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











































// // plantilla original
// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { HelloWave } from '@/components/hello-wave';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Link } from 'expo-router';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }>
//       <ThemedView style={styles.titleContainer}>
//         <ThemedText type="title">Welcome!</ThemedText>
//         <HelloWave />
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
//         <ThemedText>
//           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
//           Press{' '}
//           <ThemedText type="defaultSemiBold">
//             {Platform.select({
//               ios: 'cmd + d',
//               android: 'cmd + m',
//               web: 'F12',
//             })}
//           </ThemedText>{' '}
//           to open developer tools.
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <Link href="/modal">
//           <Link.Trigger>
//             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
//           </Link.Trigger>
//           <Link.Preview />
//           <Link.Menu>
//             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
//             <Link.MenuAction
//               title="Share"
//               icon="square.and.arrow.up"
//               onPress={() => alert('Share pressed')}
//             />
//             <Link.Menu title="More" icon="ellipsis">
//               <Link.MenuAction
//                 title="Delete"
//                 icon="trash"
//                 destructive
//                 onPress={() => alert('Delete pressed')}
//               />
//             </Link.Menu>
//           </Link.Menu>
//         </Link>

//         <ThemedText>
//           {`Tap the Explore tab to learn more about what's included in this starter app.`}
//         </ThemedText>
//       </ThemedView>
//       <ThemedView style={styles.stepContainer}>
//         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
//         <ThemedText>
//           {`When you're ready, run `}
//           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
//           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
//           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
//         </ThemedText>
//       </ThemedView>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });
