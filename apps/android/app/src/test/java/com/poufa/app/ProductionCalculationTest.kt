package com.poufa.app

import com.poufa.app.data.IndicatorsCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.util.UUID

/**
 * Tests unitaires ciblés — validation zootechnique, décompte du cheptel et idempotence.
 */
class ProductionCalculationTest {

    @Test
    fun testFlockPopulationAndMortalityWorkflow() {
        val initialChicks = 1000
        val cumulativeDeaths = 52

        // 1000 poussins mis en place − 52 morts = 948 présents
        val remainingAfterDeaths = initialChicks - cumulativeDeaths
        assertEquals(948, remainingAfterDeaths)

        // Mortalité : 5.2%
        val mortPct = IndicatorsCalculator.mortalityPct(initialChicks, cumulativeDeaths)
        assertEquals(5.2, mortPct, 0.001)

        // Viabilité : 94.8%
        val viabPct = IndicatorsCalculator.viabilityPct(initialChicks, cumulativeDeaths)
        assertEquals(94.8, viabPct, 0.001)

        // Sortie / Cession : 300 animaux cédés
        val transferred = 300
        val remainingAfterTransfer = remainingAfterDeaths - transferred
        assertEquals(648, remainingAfterTransfer)
    }

    @Test
    fun testSameOperationReplayIdempotency() {
        val initialPopulation = 948
        val transferOpId = UUID.randomUUID().toString()
        val processedOps = mutableSetOf<String>()

        var currentPopulation = initialPopulation

        fun applyTransfer(opId: String, quantity: Int) {
            if (processedOps.add(opId)) {
                currentPopulation -= quantity
            }
        }

        // Première application de l'opération
        applyTransfer(transferOpId, 300)
        assertEquals(648, currentPopulation)

        // Rejeu répété de la MÊME opération (même UUID)
        applyTransfer(transferOpId, 300)
        assertEquals(648, currentPopulation) // Pas de double déduction !
    }

    @Test
    fun testDistinctLegitimateTransfersOnSameDate() {
        val initialPopulation = 948
        val processedOps = mutableSetOf<String>()

        var currentPopulation = initialPopulation

        fun applyTransfer(opId: String, quantity: Int) {
            if (processedOps.add(opId)) {
                currentPopulation -= quantity
            }
        }

        // Transfert 1 : 50 animaux
        val op1 = UUID.randomUUID().toString()
        applyTransfer(op1, 50)
        assertEquals(898, currentPopulation)

        // Transfert 2 légitime distinct (même quantité, même jour, mais nouvel opId)
        val op2 = UUID.randomUUID().toString()
        applyTransfer(op2, 50)
        assertEquals(848, currentPopulation)
    }

    @Test
    fun testWeighingAndFeedMetrics() {
        // 30 animaux pesés pour 45.0 kg au total
        val avg = IndicatorsCalculator.averageWeightKg(45.0, 30)
        assertEquals(1.5, avg ?: 0.0, 0.001)

        // IPC : 1500 kg aliment / (1.5 kg * 1000 animaux sortis) = 1.0
        val fcr = IndicatorsCalculator.feedConversionRatio(1500.0, 1.5, 1000)
        assertEquals(1.0, fcr ?: 0.0, 0.001)

        // Pas d'animaux pesés -> null
        assertNull(IndicatorsCalculator.averageWeightKg(0.0, 0))
    }

    @Test
    fun testReceiptAcceptanceSingleIncrease() {
        var acceptedStock = 0.0
        val receiptId = UUID.randomUUID().toString()
        val confirmedReceipts = mutableSetOf<String>()

        fun confirmReceipt(id: String, qty: Double) {
            if (confirmedReceipts.add(id)) {
                acceptedStock += qty
            }
        }

        // Confirmation de la livraison de 500 kg d'aliment
        confirmReceipt(receiptId, 500.0)
        assertEquals(500.0, acceptedStock, 0.001)

        // Rejeu de la confirmation -> aucune augmentation supplémentaire
        confirmReceipt(receiptId, 500.0)
        assertEquals(500.0, acceptedStock, 0.001)
    }
}

