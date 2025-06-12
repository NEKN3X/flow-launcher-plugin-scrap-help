export type Settings = {
  sid: string;
  projects: string;
  glossary: string;
  timeout: string;
};

export type ScrapboxTitle = {
  id: string;
  links: string[];
  title: string;
  updated: number;
};

export type ScrapboxPage = {
  accessed: number;
  charsCount: number;
  collaborators: string[];
  commitId: string;
  created: number;
  descriptions: string[];
  files: string[];
  helpfeels: string[];
  icons: string[];
  id: string;
  image: string;
  infoboxDefinition: string[];
  infoboxDisableLinks: string[];
  infoboxResult: string[];
  lastAccessed: number;
  lastUpdateUser: {
    displayName: string;
    id: string;
    name: string;
    photo: string;
  };
  lines: {
    created: number;
    id: string;
    text: string;
    updated: number;
    userId: string;
  }[];
  linesCount: number;
  linked: number;
  links: string[];
  pageRank: number;
  persistent: number;
  pin: 0 | 1;
  projectLinks: string[];
  relatedPages: {
    charsCount: {
      links1hop: number;
      links2hop: number;
    };
    fatHeadwordsLc: string[];
    hasBackLinksOrIcons: number;
    hiddenHeadwordsLc: string[];
    links1hop: string[];
    links2hop: string[];
    projectLinks1hop: string[];
    search: string;
    searchBackend: string;
  };
  snapshotCount: number;
  snapshotCreated: number;
  title: string;
  updated: number;
  user: {
    displayName: string;
    id: string;
    name: string;
    photo: string;
  };
  views: number;
};
