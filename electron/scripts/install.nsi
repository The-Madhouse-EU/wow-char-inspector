;Include Modern UI
    !include MUI2.nsh

;General
    Name "Wow-Char-Inspector v${VERSION}"
    OutFile "Wow-Char-Inspector-${VERSION}.exe"

    Unicode True

    InstallDir "$PROGRAMFILES32\Wow-Char-Inspector\${VERSION}"

    !define MUI_ICON  "..\res\img\icon.ico"
    !define MUI_WELCOMEFINISHPAGE_BITMAP  "welcome.bmp"



;Pages

    !insertmacro MUI_PAGE_WELCOME
    !insertmacro MUI_PAGE_LICENSE "..\out\wow-char-inspector-win32-x64\LICENSE"
    !insertmacro MUI_PAGE_INSTFILES
    !insertmacro MUI_PAGE_FINISH

;Lang

    !insertmacro MUI_LANGUAGE "German"

;Installer Sections
    Section ""
    SetOutPath $INSTDIR
        File /nonfatal /a /r  "\\?\${BASE}\out\wow-char-inspector-win32-x64\*"
    SectionEnd

    Section "Shortcuts"
      CreateShortCut "$SMPROGRAMS\Wow-Char-Inspector.lnk" "$INSTDIR\wow-char-inspector.exe" "" "$INSTDIR\wow-char-inspector.exe" 0
      CreateShortCut "$DESKTOP\Wow-Char-Inspector.lnk" "$INSTDIR\wow-char-inspector.exe" "" "$INSTDIR\wow-char-inspector.exe" 0
    SectionEnd

