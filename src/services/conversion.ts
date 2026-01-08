import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;

interface ConversionResult {
  success: boolean;
  pdf?: string;
  message?: string;
}

export const convertXMLtoPDF = async (xmlContent: string): Promise<ConversionResult> => {
  const response = await axios.post(
    '/api/v2/fd/convert/xml-to-da',
    xmlContent,
    {
      headers: {
        'API-KEY': API_KEY,
        'Content-Type': 'text/plain',
      },
    }
  );

  return response.data;
};
