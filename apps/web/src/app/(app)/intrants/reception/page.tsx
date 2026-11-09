"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Package,
  Plus,
  ShieldCheck,
  Truck,
  Wheat,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATALOG_PRODUCTS = [
  {
    id: "alim-croiss",
    name: "Aliment Croissance Chair (Sac 50kg)",
    unit: "kg",
    multiplier: 50,
    currentStock: 1200,
    supplierDefault: "SMAG Gabon (Owendo)",
  },
  {
    id: "alim-demarr",
    name: "Aliment Démarrage Miette (Sac 50kg)",
    unit: "kg",
    multiplier: 50,
    currentStock: 450,
    supplierDefault: "SMAG Gabon (Owendo)",
  },
  {
    id: "alim-finition",
    name: "Aliment Finition Granulé (Sac 50kg)",
    unit: "kg",
    multiplier: 50,
    currentStock: 800,
    supplierDefault: "Provenderie Owendo",
  },
  {
    id: "vaccin-newcastle",
    name: "Vaccin Newcastle HB1 (Flacon 1000 doses)",
    unit: "doses",
    multiplier: 1000,
    currentStock: 2000,
    supplierDefault: "DistriVeto Gabon",
  },
  {
    id: "vitamines",
    name: "Complexe Polyvitaminé AV-Total (1L)",
    unit: "L",
    multiplier: 1,
    currentStock: 12,
    supplierDefault: "DistriVeto Gabon",
  },
];

export default function ReceptionIntrantPage() {
  const [selectedProductId, setSelectedProductId] = useState("alim-croiss");
  const [quantityPackages, setQuantityPackages] = useState<number>(20); // 20 bags = 1000 kg
  const [supplier, setSupplier] = useState("SMAG Gabon — Moulin d'Owendo");
  const [deliveryRef, setDeliveryRef] = useState("BL-SMAG-2026-904");
  const [batchCode, setBatchCode] = useState("LOT-SMAG-4421");
  const [receptionDate, setReceptionDate] = useState("2026-11-09");
  const [storageLocation, setStorageLocation] = useState("Hangar Central — Silo A");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedProduct =
    CATALOG_PRODUCTS.find((p) => p.id === selectedProductId) ||
    CATALOG_PRODUCTS[0];

  const totalQuantity = quantityPackages * selectedProduct.multiplier;
  const projectedStock = selectedProduct.currentStock + totalQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/intrants"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Stocks & Intrants</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Réception de livraison</span>
      </div>

      <PageHeader
        title="Réception de livraison d'intrants"
        description="Enregistrement d'un approvisionnement physique : traçabilité du fournisseur, numéro de bon, contrôle qualité et incrément de stock."
        badge={<Badge variant="brand">Bordereau vérifié</Badge>}
      />

      {isSubmitted ? (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Réception confirmée et enregistrée
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Le stock de{" "}
                <strong className="text-foreground">
                  {selectedProduct.name}
                </strong>{" "}
                a été crédité de{" "}
                <strong className="text-emerald-500 font-mono">
                  +{totalQuantity} {selectedProduct.unit}
                </strong>
                . Nouveau disponible : {projectedStock} {selectedProduct.unit}.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/intrants">Consulter l&apos;inventaire</Link>
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setIsSubmitted(false)}
              >
                Nouvelle réception
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Détails du bordereau de livraison
              </CardTitle>
              <CardDescription className="text-xs">
                Informations portées sur le bon de livraison du fournisseur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="produit">Article du catalogue d&apos;intrants</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger id="produit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATALOG_PRODUCTS.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.name} (Stock actuel : {prod.currentStock} {prod.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fournisseur">Fournisseur agréé</Label>
                  <Input
                    id="fournisseur"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date de réception physique</Label>
                  <Input
                    id="date"
                    type="date"
                    value={receptionDate}
                    onChange={(e) => setReceptionDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bl">Réf. Bon de livraison (BL)</Label>
                  <Input
                    id="bl"
                    value={deliveryRef}
                    onChange={(e) => setDeliveryRef(e.target.value)}
                    placeholder="Ex. : BL-SMAG-2026-904"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot">N° de lot fournisseur</Label>
                  <Input
                    id="lot"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    placeholder="Ex. : LOT-SMAG-4421"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qte">
                    Nombre d&apos;unités livrées (sacs / flacons)
                  </Label>
                  <Input
                    id="qte"
                    type="number"
                    min={1}
                    value={quantityPackages}
                    onChange={(e) => setQuantityPackages(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emplacement">Emplacement de stockage</Label>
                  <Select
                    value={storageLocation}
                    onValueChange={setStorageLocation}
                  >
                    <SelectTrigger id="emplacement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hangar Central — Silo A">
                        Hangar Central — Silo A
                      </SelectItem>
                      <SelectItem value="Hangar Central — Silo B">
                        Hangar Central — Silo B
                      </SelectItem>
                      <SelectItem value="Magasin Frigo Vétérinaire">
                        Magasin Frigo Vétérinaire (2-8°C)
                      </SelectItem>
                      <SelectItem value="Réserve aliments Bâtiment A">
                        Réserve aliments Bâtiment A
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Stock Projection Calculation */}
              <div className="rounded-lg border border-border p-3.5 bg-secondary/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Impact direct sur le stock d&apos;exploitation</span>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    + {totalQuantity} {selectedProduct.unit}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block">Stock actuel</span>
                    <span className="font-mono font-semibold">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Livraison nette</span>
                    <span className="font-mono font-semibold text-emerald-500">
                      + {totalQuantity} {selectedProduct.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Stock projeté</span>
                    <span className="font-mono font-bold text-foreground">
                      {projectedStock} {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/intrants">Annuler</Link>
            </Button>
            <Button type="submit" variant="brand">
              <FileCheck className="size-4 mr-1.5" />
              Confirmer l&apos;entrée en stock
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
