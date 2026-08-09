import { PortfolioProject } from '../types';
import { supabase } from '../lib/supabase';

export const INITIAL_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'port-1',
    title: 'Branding & Rotulación Corpórea Polar',
    category: 'Branding & Rotulación',
    clientName: 'Empresas Polar S.A.',
    projectDate: 'Mayo 2026',
    description: 'Proyecto integral de imagen corporativa con rotulación en vinil calandrado de alta durabilidad, señalética en letras corpóreas 3D en acrílico con iluminación LED indirecta y ambientación de flota de transporte comercial.',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a3121699491?q=80&w=1200&auto=format&fit=crop',
    imageUrl2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    imageUrl3: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 5,
    reviewText: 'Excelente trabajo de rotulación. Cumplieron los tiempos con absoluta precisión y el acabado de las letras corpóreas con luz LED superó nuestras expectativas.',
    reviewerName: 'Ing. Gustavo Mendoza • Director de Marca',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'port-2',
    title: 'Gigantografía Impresión UV Valla Principal',
    category: 'Gigantografía',
    clientName: 'Concesionarios Automotrices Ford',
    projectDate: 'Abril 2026',
    description: 'Impresión en lona traslúcida de 13 oz con tintas ecológicas UV de máxima protección solar contra rayos ultravioleta. Dimensiones 12x4 metros con confección de ruedos reforzados y ojetes metálicos de alto rendimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    imageUrl2: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=1200&auto=format&fit=crop',
    imageUrl3: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop',
    videoUrl: '',
    rating: 5,
    reviewText: 'La viveza de los colores bajo la luz del sol caribeño es sorprendente. La lona ha resistido vientos fuertes sin un solo rasguño.',
    reviewerName: 'Dra. Valentina Ríos • Gerente de Mercadeo',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'port-3',
    title: 'Empaques Deluxe & Foil Metalizado Oro',
    category: 'Empaques Deluxe',
    clientName: 'Ron Santa Teresa Reserva',
    projectDate: 'Marzo 2026',
    description: 'Cajas rígidas de lujo para edición limitada. Cartón sulfatado de 350g con troquelado personalizado, plastificado mate antirrayaduras y estampa foil metalizado dorado con relieve seco (embossing).',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop',
    imageUrl2: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=1200&auto=format&fit=crop',
    imageUrl3: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    rating: 5,
    reviewText: 'Elegancia absoluta. El foil dorado y el toque texturizado le dieron a nuestro empaque un carácter internacional que cautivó a los compradores.',
    reviewerName: 'Alejandro Vollmer • Director Creativo',
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'port-4',
    title: 'Prototipado e Impresión 3D Muestra Agro',
    category: 'Impresión 3D',
    clientName: 'AgroInversiones Venezuela',
    projectDate: 'Febrero 2026',
    description: 'Fabricación a escala de maqueta de maquinaria agroindustrial mediante tecnología FDM y resina fotopolímera de ultra precisión. Acabados pintados a mano con laca automotriz brillante.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    imageUrl2: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop',
    imageUrl3: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
    videoUrl: '',
    rating: 5,
    reviewText: 'El nivel de detalle de las piezas articuladas en 3D impresionó a todos los inversionistas en la feria. Trabajo impecable.',
    reviewerName: 'Ing. Roberto Silva • Gerente de Operaciones',
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'port-5',
    title: 'Grabado Láser y Trofeos Corpóreos Madera & Acrílico',
    category: 'Láser & Corpóreos',
    clientName: 'Banco Mercantil',
    projectDate: 'Enero 2026',
    description: 'Producción de 120 galardones corporativos combinando madera noble tratada con grabado láser de fibra óptica y capas de acrílico cristal de 10mm con canto pulido al diamante.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    imageUrl2: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    imageUrl3: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    videoUrl: '',
    rating: 5,
    reviewText: 'Un trabajo fino y refinado. Los ejecutivos premiados destacaron el peso y la transparencia limpia del trofeo.',
    reviewerName: 'Lic. Sofia Benítez • Gestión Humana',
    featured: false,
    createdAt: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'design_store_portfolio_v1';

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        clientName: item.client_name || '',
        projectDate: item.project_date || '',
        description: item.description || '',
        imageUrl: item.image_url || '',
        imageUrl2: item.image_url_2 || '',
        imageUrl3: item.image_url_3 || '',
        videoUrl: item.video_url || '',
        rating: Number(item.rating) || 5,
        reviewText: item.review_text || '',
        reviewerName: item.reviewer_name || '',
        featured: Boolean(item.featured),
        createdAt: item.created_at
      }));
    }
  } catch (err) {
    console.warn('Could not fetch portfolio from Supabase, using local state fallback', err);
  }

  // Fallback to local storage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }

  // Initial populate
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_PROJECTS));
  return INITIAL_PORTFOLIO_PROJECTS;
}

export async function savePortfolioProject(project: PortfolioProject): Promise<boolean> {
  // Update Local Storage
  const current = await getPortfolioProjects();
  const existingIndex = current.findIndex(p => p.id === project.id);
  let updatedList: PortfolioProject[] = [];

  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = { ...project };
  } else {
    updatedList = [project, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  // Try Supabase sync
  try {
    const supabasePayload = {
      id: project.id,
      title: project.title,
      category: project.category,
      client_name: project.clientName,
      project_date: project.projectDate,
      description: project.description,
      image_url: project.imageUrl,
      image_url_2: project.imageUrl2 || '',
      image_url_3: project.imageUrl3 || '',
      video_url: project.videoUrl || '',
      rating: project.rating || 5,
      review_text: project.reviewText || '',
      reviewer_name: project.reviewerName || '',
      featured: project.featured || false
    };

    const { error } = await supabase
      .from('portfolio_projects')
      .upsert([supabasePayload]);

    if (error) {
      console.warn('Supabase portfolio upsert warning:', error.message);
    }
  } catch (e) {
    console.warn('Error saving portfolio to Supabase:', e);
  }

  return true;
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  const current = await getPortfolioProjects();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

  try {
    await supabase.from('portfolio_projects').delete().eq('id', id);
  } catch (e) {
    console.warn('Error deleting portfolio project from Supabase:', e);
  }

  return true;
}

export async function resetDemoPortfolioProjects(): Promise<PortfolioProject[]> {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_PROJECTS));
  
  // Try clearing and re-inserting in Supabase
  try {
    for (const project of INITIAL_PORTFOLIO_PROJECTS) {
      await savePortfolioProject(project);
    }
  } catch {
    // ignore
  }

  return INITIAL_PORTFOLIO_PROJECTS;
}
