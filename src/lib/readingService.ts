export async function registerReading(readingData: {
  unit: string;
  utility_type: string;
  reading: number;
  reading_date: string;
  previous_reading: number;
}) {
  try {
    const consumption = readingData.reading - readingData.previous_reading;
    
    const { data, error } = await supabase
      .from('meter_readings')
      .insert({
        ...readingData,
        consumption,
        created_at: new Date().toISOString()
      })
      .select() // Importante: selecionar para retornar o ID
      .single();

    if (error) {
      console.error('Erro ao registrar leitura:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao registrar leitura:', error);
    return { success: false, error };
  }
}