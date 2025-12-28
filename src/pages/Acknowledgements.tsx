import { Link } from 'react-router-dom'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '../components/ui'

interface AcknowledgementItem {
  title: string
  description: string
  url?: string
  linkText?: string
}

const acknowledgements: AcknowledgementItem[] = [
  {
    title: "Verse of the Day",
    description: "Daily Bible verses are provided by OurManna, a free service that delivers Scripture to encourage and inspire.",
    url: "https://ourmanna.com/",
    linkText: "Visit OurManna",
  },
  {
    title: "Professor Grant Horner's Bible Reading System",
    description: "The 10-list cycling reading plan that allows readers to see how different parts of Scripture relate to and comment on each other through varied daily readings.",
    url: "https://sohmer.net/media/professor_grant_horners_bible_reading_system.pdf",
    linkText: "View Original PDF",
  },
  {
    title: "Robert Murray M'Cheyne Bible Reading Plan",
    description: "A classic Bible reading plan designed to take readers through the New Testament and Psalms twice, and the rest of the Old Testament once in a year.",
    url: "http://www.edginet.org/mcheyne/printables.html",
    linkText: "View M'Cheyne Resources",
  },
  {
    title: "52 Week Bible Reading Plan",
    description: "A structured weekly reading plan that guides readers through the entire Bible over the course of a year with balanced daily readings from different sections of Scripture.",
    url: "https://www.ligonier.org/",
    linkText: "Visit Ligonier Ministries",
  },
  {
    title: "Press Start 2P Font",
    description: "The pixel-style font used throughout the application, designed by CodeMan38 and available through Google Fonts.",
    url: "https://fonts.google.com/specimen/Press+Start+2P",
    linkText: "View on Google Fonts",
  },
]

export function Acknowledgements() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO HOME
      </Link>

      {/* Header */}
      <Card variant="elevated">
        <CardContent>
          <h1 className="font-pixel text-sm text-ink mb-3">
            ACKNOWLEDGEMENTS
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Biblical Battle Plans is built upon the work and resources of many others.
            We gratefully acknowledge the following contributions that make this app possible.
          </p>
        </CardContent>
      </Card>

      {/* Acknowledgements List */}
      <div className="space-y-4">
        {acknowledgements.map((item, index) => (
          <Card key={index} noPadding>
            <div className="p-5">
              <h2 className="font-pixel text-[0.75rem] text-ink mb-3">
                {item.title.toUpperCase()}
              </h2>
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-4">
                {item.description}
              </p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-sage hover:text-sage-dark transition-colors"
                >
                  {item.linkText || 'Learn More'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer note */}
      <Card>
        <CardContent className="text-center">
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            If you believe we have missed an attribution or have questions about
            the resources used, please contact us.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
