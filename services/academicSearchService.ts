import { SearchResult } from '../types';

const mockPapers: SearchResult[] = [
  // Computer Science
  { id: 'cs1', title: 'Attention Is All You Need', authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'], publicationYear: 2017, abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.', journal: 'NIPS', category: 'Computer Science', citationCount: 85203, pdfUrl: 'https://arxiv.pdf/1706.03762', sourceUrl: 'https://arxiv.org/abs/1706.03762' },
  { id: 'cs2', title: 'Deep Residual Learning for Image Recognition', authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'], publicationYear: 2016, abstract: 'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.', journal: 'CVPR', category: 'Computer Science', citationCount: 154021, pdfUrl: 'https://arxiv.pdf/1512.03385', sourceUrl: 'https://arxiv.org/abs/1512.03385' },
  
  // Medicine
  { id: 'med1', title: 'A new antibiotic kills pathogens without detectable resistance', authors: ['Losee L. Ling', 'Tamara A. Schneider', 'Aaron J. Peoples'], publicationYear: 2015, abstract: 'Here we describe a new antibiotic, teixobactin, that kills Gram-positive bacteria, including S. aureus, M. tuberculosis and S. pyogenes, without any detectable resistance.', journal: 'Nature', category: 'Medicine', citationCount: 3412, sourceUrl: 'https://www.nature.com/articles/nature14098' },
  { id: 'med2', title: 'An RNA-guided nuclease complex for genome editing', authors: ['Martin Jinek', 'Krzysztof Chylinski', 'Ines Fonfara', 'Michael Hauer'], publicationYear: 2012, abstract: 'We show that Cas9, a protein from the CRISPR immune system of Streptococcus pyogenes, can be programmed with a single RNA molecule to create site-specific double-strand breaks in DNA.', journal: 'Science', category: 'Medicine', citationCount: 18356, sourceUrl: 'https://science.sciencemag.org/content/337/6096/816' },
  
  // Physics
  { id: 'phy1', title: 'Observation of Gravitational Waves from a Binary Black Hole Merger', authors: ['B.P. Abbott', 'et al. (LIGO Scientific Collaboration and Virgo Collaboration)'], publicationYear: 2016, abstract: 'On September 14, 2015 at 09:50:45 UTC the two detectors of the Laser Interferometer Gravitational-Wave Observatory (LIGO) simultaneously observed a transient gravitational-wave signal.', journal: 'Physical Review Letters', category: 'Physics', citationCount: 12500, sourceUrl: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.116.061102' },

  // Social Science
  { id: 'soc1', title: 'A theory of rational addiction', authors: ['Gary S. Becker', 'Kevin M. Murphy'], publicationYear: 1988, abstract: 'We develop a model of rational addictive behavior based on the assumption that individuals maximize utility consistently over time.', journal: 'Journal of Political Economy', category: 'Social Science', citationCount: 15234, sourceUrl: 'https://www.journals.uchicago.edu/doi/abs/10.1086/261558' },

  // Literature & Arts
  { id: 'art1', title: 'The Work of Art in the Age of Mechanical Reproduction', authors: ['Walter Benjamin'], publicationYear: 1936, abstract: 'A seminal essay in the history of art theory, which discusses the political advantages of mechanical reproduction for the emancipation of the work of art from its cult value.', journal: 'Schriften', category: 'Literature & Arts', citationCount: 22019, sourceUrl: 'https://en.wikipedia.org/wiki/The_Work_of_Art_in_the_Age_of_Mechanical_Reproduction' },

  // Earth Science
  { id: 'earth1', title: 'The discovery of the Antarctic ozone hole', authors: ['J. C. Farman', 'B. G. Gardiner', 'J. D. Shanklin'], publicationYear: 1985, abstract: 'Recent measurements of ozone at Halley Bay have shown a considerable fall in the total ozone in the spring.', journal: 'Nature', category: 'Earth Science', citationCount: 4891, sourceUrl: 'https://www.nature.com/articles/315207a0' },
];

export const searchPapers = async (query: string): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  if (!query) return [];
  return mockPapers.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.abstract.toLowerCase().includes(query.toLowerCase()));
};

export const getTrendingPapers = async (): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockPapers].sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0)).slice(0, 10);
};

export const getTopPapersByCategory = async (category: string): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPapers.filter(p => p.category === category)
      .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
      .slice(0, 10);
};

export const getPapersByIds = async (ids: Set<string>): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate tiny delay
  const idArray = Array.from(ids);
  // Preserve the order of the original Set (most recently added first)
  const sortedPapers = idArray.map(id => mockPapers.find(p => p.id === id)).filter((p): p is SearchResult => p !== undefined);
  return sortedPapers.reverse();
};