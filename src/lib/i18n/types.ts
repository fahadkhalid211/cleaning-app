export type Locale = 'en' | 'cn';

export interface TranslationDictionary {
  locale: Locale;
  common: {
    brandName: string;
    phone: string;
    email: string;
    callUs: string;
    preferToTalk: string;
    hours: string;
    forHomes: string;
    forBusinesses: string;
    hostelAndBunks: string;
    newBadge: string;
    mostPopular: string;
    from: string;
    perHour: string;
    perNight: string;
    perNightPerBed: string;
    myAccount: string;
    logIn: string;
    bookAClean: string;
    bookABunk: string;
    howItWorks: string;
    prices: string;
    help: string;
    services: string;
    copyright: string;
    vatNotice: string;
    footerDesc: string;
    ourTeam: string;
    cleanerLogin: string;
    staffAdmin: string;
    liveBunkSelector: string;
    questions: string;
    customerLogIn: string;
    menu: string;
    closeMenu: string;
  };
  home: {
    metaTitle: string;
    metaDesc: string;
    hero: {
      lovedByFamilies: string;
      title: string;
      titleHighlight: string;
      bullets: string[];
      ctaBook: string;
      callNumber: string;
      noCardNeeded: string;
      payAfter: string;
      imgAlt: string;
    };
    trust: {
      vetted: string;
      vettedDesc: string;
      fixed: string;
      fixedDesc: string;
      guarantee: string;
      guaranteeDesc: string;
      flexible: string;
      flexibleDesc: string;
    };
    servicesSection: {
      eyebrow: string;
      title: string;
      sub: string;
      bookService: string;
      popularExtras: string;
      getPrice: string;
    };
    howItWorksSection: {
      eyebrow: string;
      title: string;
      steps: { title: string; text: string }[];
      ctaBook: string;
    };
    whyUsSection: {
      eyebrow: string;
      title: string;
      points: string[];
      badges: { label: string }[];
    };
    reviewsSection: {
      eyebrow: string;
      title: string;
      reviews: { name: string; title: string; text: string }[];
    };
    faqSection: {
      eyebrow: string;
      title: string;
      faqs: { q: string; a: string }[];
    };
    commercialSection: {
      readyTitle: string;
      readySub: string;
      businessBadge: string;
      businessTitle: string;
      businessDesc: string;
      businessCall: string;
      businessEmail: string;
      cleanerBadge: string;
      cleanerTitle: string;
      cleanerDesc: string;
      cleanerSignUp: string;
      cleanerLoginBtn: string;
      staffStayBadge: string;
      staffStayTitle: string;
      staffStayDesc: string;
      staffStayBtn: string;
    };
    mobileBar: {
      bookAClean: string;
    };
  };
  hostel: {
    metaTitle: string;
    metaDesc: string;
    hero: {
      badge: string;
      title: string;
      desc: string;
      ctaLiveMap: string;
      ctaExploreRooms: string;
      highlights: {
        instantSelection: string;
        depositOption: string;
        gigabitWifi: string;
        keycardEntry: string;
      };
    };
    preview: {
      tag: string;
      dormName: string;
      realtimeAvailability: string;
      group1Title: string;
      bed1aTitle: string;
      topBadge: string;
      upperWindow: string;
      selectedBadge: string;
      bed1bTitle: string;
      bottomBadge: string;
      lowerStorage: string;
      occupiedBadge: string;
      reservedText: string;
      legendAvailable: string;
      legendSelected: string;
      legendOccupied: string;
      launchSelector: string;
    };
    experience: {
      eyebrow: string;
      title: string;
      sub: string;
      cards: { title: string; text: string }[];
    };
    rooms: {
      eyebrow: string;
      title: string;
      sub: string;
      highlightsHeading: string;
      selectBedBtn: string;
      floorPrefix: string;
      bunkBedsCount: string;
      types: Record<string, string>;
      items: Record<
        string,
        {
          name: string;
          description: string;
          features: string[];
        }
      >;
    };
    faqs: {
      eyebrow: string;
      title: string;
      sub: string;
      list: { q: string; a: string }[];
      groupTitle: string;
      groupSub: string;
      bookOnlineBtn: string;
    };
    mobileBar: {
      label: string;
      chooseBed: string;
    };
  };
  hostelBook: {
    metaTitle: string;
    metaDesc: string;
    backToOverview: string;
    instantConfirm: string;
    liveBunkMap: string;
    loadingMap: string;
    dates: {
      checkIn: string;
      checkOut: string;
      nightsCount: (n: number) => string;
    };
    rooms: {
      title: string;
      selectRoomLabel: string;
    };
    filters: {
      allBunks: string;
      lowerBunks: string;
      upperBunks: string;
    };
    legend: {
      available: string;
      yourBed: string;
      occupied: string;
    };
    floorplan: {
      windowsNote: string;
      ensuiteNote: string;
      bedsAvailableSuffix: string;
      doorEntry: string;
    };
    podCard: {
      podUnitPrefix: string;
      doublePod: string;
      upper: string;
      lower: string;
      topSingle: string;
      bottomSingle: string;
      dimensions: string;
      occupiedLabel: string;
      reservedLabel: string;
      selectedLabel: string;
      powerUsb: string;
      readingLight: string;
      curtain: string;
      locker: string;
      selectThisBed: string;
    };
    summaryBar: {
      selectedBedPrompt: string;
      selectedBedTitle: string;
      unit: string;
      tier: string;
      nightlyRate: string;
      stayTotal: string;
      depositToday: string;
      continueBtn: string;
    };
    addons: Record<
      string,
      {
        name: string;
        description: string;
      }
    >;
    detailsStep: {
      heading: string;
      sub: string;
      guestInfoTitle: string;
      fullNameLabel: string;
      fullNamePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      genderLabel: string;
      genderMale: string;
      genderFemale: string;
      genderUnspecified: string;
      arrivalTimeLabel: string;
      specialRequestsLabel: string;
      specialRequestsPlaceholder: string;
      createPasswordLabel: string;
      createPasswordPlaceholder: string;
      extrasTitle: string;
      bookingSummaryTitle: string;
      roomLabel: string;
      datesLabel: string;
      bedLabel: string;
      nightsLabel: string;
      basePriceLabel: string;
      extrasLabel: string;
      totalCostLabel: string;
      depositDueTodayLabel: string;
      balanceAtCheckinLabel: string;
      depositNotice: string;
      payWithPaypalBtn: string;
      payOnArrivalBtn: string;
      processingPayment: string;
      confirmAndPayBtn: string;
      backToBedSelection: string;
    };
  };
  booking: {
    metaTitle: string;
    metaDesc: string;
    steps: [string, string, string, string];
    serviceLabel: string;
    frequencyLabel: string;
    frequencies: {
      one_off: string;
      weekly: string;
      biweekly: string;
      monthly: string;
    };
    roomsLabel: string;
    bedrooms: string;
    bathrooms: string;
    kitchens: string;
    livingRooms: string;
    extraAreas: string;
    extrasLabel: string;
    dateLabel: string;
    timeLabel: string;
    addressLabel: string;
    street: string;
    city: string;
    postcode: string;
    accessMethod: string;
    accessMethods: Record<string, string>;
    accessNotes: string;
    hasPets: string;
    notes: string;
    reviewTitle: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmBtn: string;
    continueBtn: string;
    backBtn: string;
    totalLabel: string;
    perClean: string;
    estimatedHours: string;
    summaryTitle: string;
  };
  account: {
    title: string;
    welcome: string;
    signOut: string;
    tabs: {
      all: string;
      hostel: string;
      cleaning: string;
    };
    noBookings: string;
    bookBunkBtn: string;
    bookCleanBtn: string;
    hostelCard: {
      badge: string;
      dorm: string;
      bed: string;
      checkIn: string;
      checkOut: string;
      nights: string;
      total: string;
      depositPaid: string;
      balanceDue: string;
      status: string;
      statusPaid: string;
      statusConfirmed: string;
      statusPending: string;
      cancelBtn: string;
    };
    cleaningCard: {
      badge: string;
      service: string;
      date: string;
      address: string;
      price: string;
      status: string;
      cancelBtn: string;
      rescheduleBtn: string;
    };
  };
  auth: {
    loginTitle: string;
    loginSub: string;
    registerTitle: string;
    registerSub: string;
    tabLogin: string;
    tabRegister: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    phoneLabel: string;
    loginSubmit: string;
    registerSubmit: string;
    forgotPassword: string;
    cleanerWorkPrompt: string;
    joinCleaningTeam: string;
  };
  servicesCatalog: Record<
    string,
    {
      title: string;
      short: string;
      description: string;
    }
  >;
  addonsCatalog: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
}
